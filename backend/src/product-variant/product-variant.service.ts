import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductVariantDto) {
    // 1. Check SKU trùng
    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (existingSku) throw new ConflictException('SKU đã tồn tại');

    // 2. Check product tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product không tồn tại');

    // 3. Tạo variant
    return this.prisma.productVariant.create({
      data: dto,
      include: { product: true },
    });
  }

  findAll(search?: string) {
    return this.prisma.productVariant.findMany({
      where: search
        ? { OR: [{ sku: { contains: search } }, { size: { contains: search } }] }
        : {},
      include: { product: true },
    });
  }

  findOne(id: string) {
    return this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    return this.prisma.productVariant.update({
      where: { id },
      data: updateProductVariantDto,
      include: { product: true },
    });
  }

  remove(id: string) {
    return this.prisma.productVariant.delete({
      where: { id },
      include: { product: true },
    });
  }
}
