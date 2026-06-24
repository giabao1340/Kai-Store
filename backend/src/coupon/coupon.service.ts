import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    // Check code trùng
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Mã coupon đã tồn tại');

    return this.prisma.coupon.create({ data: dto });
  }

  // Lấy tất cả, filter theo isActive nếu có
  findAll(isActive?: boolean) {
    return this.prisma.coupon.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon không tồn tại');
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id); // check tồn tại
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); // check tồn tại
    return this.prisma.coupon.delete({ where: { id } });
  }
  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });

    if (!coupon) throw new NotFoundException('Mã coupon không tồn tại');
    if (!coupon.isActive)
      throw new BadRequestException('Mã coupon đã hết hiệu lực');
    if (coupon.endDate < new Date())
      throw new BadRequestException('Mã coupon đã hết hạn');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Mã coupon đã hết lượt dùng');
    }

    return coupon;
  }
}
