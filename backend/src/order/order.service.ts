import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private emailService: EmailService,
  ) {}

  // ── Tạo đơn hàng ──────────────────────────────────
  async createOrder(userId: string, dto: CreateOrderDto) {
    // ... code cũ giữ nguyên đến bước 5
    // 1. Lấy giỏ hàng hiện tại
    const cart = await this.prisma.cart.findUnique({
      where: { userId }, //
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống');
    }

    // 2. Kiểm tra tồn kho từng item
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${item.variant.product.name} - ${item.variant.size} - ${item.variant.color}" chỉ còn ${item.variant.stock} trong kho`,
        );
      }
    }

    // 3. Tính tổng tiền
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    // 4. Xử lý coupon nếu có
    let discountAmount = 0;
    let couponId: string | null = null;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });

      if (!coupon) throw new NotFoundException('Mã coupon không tồn tại');
      if (!coupon.isActive)
        throw new BadRequestException('Mã coupon đã hết hiệu lực');
      if (coupon.endDate < new Date())
        throw new BadRequestException('Mã coupon đã hết hạn');
      if (coupon.startDate > new Date())
        throw new BadRequestException('Mã coupon chưa có hiệu lực');
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('Mã coupon đã hết lượt sử dụng');
      }
      if (coupon.minOrderValue && totalAmount < Number(coupon.minOrderValue)) {
        throw new BadRequestException(
          `Đơn hàng tối thiểu ${Number(coupon.minOrderValue).toLocaleString('vi-VN')}đ để dùng mã này`,
        );
      }

      // Tính discount
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (totalAmount * Number(coupon.discountValue)) / 100;
        // Áp dụng maxDiscount nếu có
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
        }
      } else {
        // FIXED
        discountAmount = Number(coupon.discountValue);
      }

      couponId = coupon.id;
    }
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Generate confirm token
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const confirmExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          couponId,
          snapFullName: dto.snapFullName,
          snapPhone: dto.snapPhone,
          snapProvince: dto.snapProvince,
          snapDistrict: dto.snapDistrict,
          snapWard: dto.snapWard,
          snapStreet: dto.snapStreet,
          totalAmount,
          discountAmount,
          finalAmount,
          note: dto.note,
          confirmToken, // ← thêm
          confirmExpiredAt, // ← thêm
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              snapProductName: item.variant.product.name,
              snapSize: item.variant.size,
              snapColor: item.variant.color,
              snapSku: item.variant.sku,
              snapImageUrl: item.variant.product.images.find(
                (img) => img.isPrimary,
              )?.url,
              quantity: item.quantity,
              price: item.variant.price,
            })),
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              amount: finalAmount,
              status: 'UNPAID',
            },
          },
        },
        include: { items: true, payment: true },
      });

      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    await this.cartService.clearCart(userId);

    // Lấy thông tin user để gửi email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    // Gửi email xác nhận (không await để không block response)
    if (user) {
      this.emailService.sendOrderConfirmationEmail({
        to: user.email,
        userName: user.name,
        orderId: order.id,
        finalAmount: Number(finalAmount),
        items: order.items,
        snapFullName: dto.snapFullName,
        snapPhone: dto.snapPhone,
        snapStreet: dto.snapStreet,
        snapWard: dto.snapWard,
        snapDistrict: dto.snapDistrict,
        snapProvince: dto.snapProvince,
        confirmToken,
      });
    }

    return order;
  }
  // ── Xác nhận đơn hàng qua token ───────────────────
  async confirmOrder(token: string, action: 'confirm' | 'cancel' = 'confirm') {
    const order = await this.prisma.order.findUnique({
      where: { confirmToken: token },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Token không hợp lệ');

    if (order.status !== 'PENDING') {
      return {
        success: false,
        message: `Đơn hàng đã ở trạng thái ${order.status}`,
        orderId: order.id,
      };
    }

    // Kiểm tra hết hạn
    if (order.confirmExpiredAt && order.confirmExpiredAt < new Date()) {
      // Tự động hủy nếu quá hạn
      await this.autoCancelExpiredOrder(order);
      return {
        success: false,
        message: 'Token đã hết hạn, đơn hàng đã bị hủy',
        orderId: order.id,
      };
    }

    if (action === 'cancel') {
      await this.cancelOrderByToken(order);
      return {
        success: true,
        message: 'Đã hủy đơn hàng',
        orderId: order.id,
      };
    }

    // Xác nhận đơn hàng
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        confirmToken: null, // xóa token sau khi dùng
      },
    });

    return {
      success: true,
      message: 'Xác nhận đơn hàng thành công',
      orderId: order.id,
    };
  }

  private async cancelOrderByToken(order: any) {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', confirmToken: null },
      });

      // Hoàn lại tồn kho
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    });
  }

  private async autoCancelExpiredOrder(order: any) {
    await this.cancelOrderByToken(order);
  }

  // ── Lấy danh sách đơn hàng của user ───────────────
  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Lấy chi tiết 1 đơn hàng ───────────────────────
  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            variant: {
              select: { productId: true }, // ← thêm để lấy productId
            },
          },
        },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return order;
  }

  // ── Hủy đơn hàng ──────────────────────────────────
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Chỉ hủy được khi đang PENDING hoặc CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException(
        `Không thể hủy đơn hàng ở trạng thái "${order.status}"`,
      );
    }

    // Hoàn lại tồn kho + cập nhật trạng thái trong transaction
    await this.prisma.$transaction(async (tx) => {
      // Cập nhật trạng thái order
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // Hoàn lại tồn kho
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Giảm usedCount coupon nếu có
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    });

    return { message: 'Hủy đơn hàng thành công' };
  }

  // ── Admin: Cập nhật trạng thái đơn hàng ───────────
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Không thể chuyển ngược trạng thái
    const flow = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
    const currentIndex = flow.indexOf(order.status);
    const newIndex = flow.indexOf(status);

    if (newIndex !== -1 && newIndex < currentIndex) {
      throw new BadRequestException(
        'Không thể chuyển ngược trạng thái đơn hàng',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
