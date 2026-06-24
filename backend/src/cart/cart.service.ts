import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';


@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // ── Lấy hoặc tạo cart cho user ────────────────────
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    // Nếu chưa có cart → tự động tạo mới
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  // ── Lấy giỏ hàng của user hiện tại ───────────────
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
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

    if (!cart) return { items: [], total: 0 };

    // Tính tổng tiền
    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    return { ...cart, total };
  }

  // ── Thêm sản phẩm vào giỏ ─────────────────────────
  async addToCart(userId: string, dto: AddToCartDto) {
    // 1. Check variant tồn tại và còn hàng
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant) throw new NotFoundException('Sản phẩm không tồn tại');
    if (variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Chỉ còn ${variant.stock} sản phẩm trong kho`,
      );
    }

    // 2. Lấy hoặc tạo cart
    const cart = await this.getOrCreateCart(userId);

    // 3. Kiểm tra item đã có trong giỏ chưa
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    if (existingItem) {
      // Nếu đã có → cộng thêm số lượng
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity > variant.stock) {
        throw new BadRequestException(
          `Chỉ còn ${variant.stock} sản phẩm trong kho`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Chưa có → tạo item mới
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    // Trả về giỏ hàng mới nhất
    return this.getCart(userId);
  }

  // ── Cập nhật số lượng item ─────────────────────────
  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    // 1. Check item tồn tại và thuộc về user này
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: { variant: true },
    });
    if (!item)
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');

    // 2. Check số lượng tồn kho
    if (dto.quantity > item.variant.stock) {
      throw new BadRequestException(
        `Chỉ còn ${item.variant.stock} sản phẩm trong kho`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  // ── Xóa 1 item khỏi giỏ ───────────────────────────
  async removeCartItem(userId: string, itemId: string) {
    // Check item thuộc về user này
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });
    if (!item)
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  // ── Xóa toàn bộ giỏ hàng ──────────────────────────
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { message: 'Giỏ hàng đã trống' };

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { message: 'Đã xóa toàn bộ giỏ hàng' };
  }
}
