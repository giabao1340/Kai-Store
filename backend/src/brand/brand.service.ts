import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  // ── Lấy tất cả (có tìm kiếm) ──────────────────────
  async findAll(search?: string) {
    return this.prisma.brand.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Lấy 1 brand theo id ───────────────────────────
  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true }, // kèm danh sách sản phẩm
    });

    if (!brand) throw new NotFoundException('Brand không tồn tại');
    return brand;
  }

  // ── Tạo mới ───────────────────────────────────────
  async create(dto: CreateBrandDto) {
    const existing = await this.prisma.brand.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug đã tồn tại');

    return this.prisma.brand.create({ data: dto });
  }

  // ── Cập nhật ──────────────────────────────────────
  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id); // check tồn tại

    return this.prisma.brand.update({
      where: { id },
      data: dto,
    });
  }

  // ── Xóa ───────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id); // check tồn tại

    return this.prisma.brand.delete({ where: { id } });
  }

  // ── Cập nhật logo URL sau khi upload ──────────────
  async updateLogo(id: string, logoUrl: string) {
    await this.findOne(id);

    return this.prisma.brand.update({
      where: { id },
      data: { logoUrl },
    });
  }
}
