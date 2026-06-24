import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    // 1. Check đã review chưa — dùng findUnique vì có @@unique
    const existed = await this.prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
    });
    if (existed)
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');

    // 2. Xử lý orderId
    let isVerified = false;

    if (dto.orderId) {
      // Có orderId → validate order
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, userId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status !== 'DELIVERED') {
        throw new BadRequestException('Chỉ được đánh giá đơn hàng đã giao');
      }

      // Check sản phẩm có trong đơn hàng không
      const matchedVariant = await this.prisma.productVariant.findFirst({
        where: {
          productId: dto.productId,
          id: { in: order.items.map((item) => item.variantId) },
        },
      });
      if (!matchedVariant) {
        throw new BadRequestException('Sản phẩm không thuộc đơn hàng này');
      }

      isVerified = false; // chờ admin duyệt
    }

    // 3. Tạo review
    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
        isVerified,
      },
    });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }, // ← không trả password
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findApprovedReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, isVerified: true },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!review) throw new NotFoundException('Không tìm thấy review');
    return review;
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new NotFoundException('Review không tồn tại');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating,
        comment: dto.comment,
        isVerified: false, // ← reset lại chờ admin duyệt lại
      },
    });
  }

  async remove(reviewId: string, userId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new NotFoundException('Review không tồn tại');

    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async approveReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review không tồn tại');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isVerified: true },
    });
  }
}
