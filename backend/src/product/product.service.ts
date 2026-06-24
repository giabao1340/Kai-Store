import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) throw new ConflictException('Slug đã tồn tại');

    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    });
    if (!brand) throw new NotFoundException('Brand không tồn tại');

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category không tồn tại');

    return this.prisma.product.create({
      data: dto,
      include: { brand: true, category: true },
    });
  }

  async findAll(query: {
    search?: string;
    isFeatured?: string;
    brandId?: string;
    categoryId?: string;
    limit?: string;
  }) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(query.search && {
          name: { contains: query.search, mode: 'insensitive' },
        }),
        ...(query.isFeatured === 'true' && { isFeatured: true }),
        ...(query.brandId && { brandId: query.brandId }),
        ...(query.categoryId && { categoryId: query.categoryId }),
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ? parseInt(query.limit) : undefined,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
      },
    });
    if (!product) throw new NotFoundException('Product không tồn tại');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { brand: true, category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
