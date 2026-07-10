import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImageService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async uploadImages(productId: string, files: Express.Multer.File[]) {
    // 1. Check product tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!product) throw new NotFoundException('Product không tồn tại');

    // 2. Upload tất cả ảnh lên Cloudinary song song
    const urls = await this.cloudinary.uploadImages(files, 'products');

    // 3. Lưu tất cả URL vào DB
    // Ảnh đầu tiên tự động là primary nếu product chưa có ảnh nào
    const hasImages = product.images.length > 0;

    const images = await Promise.all(
      urls.map((url, index) =>
        this.prisma.productImage.create({
          data: {
            productId,
            url,
            isPrimary: !hasImages && index === 0, // ảnh đầu tiên là primary
            order: product.images.length + index,
          },
        }),
      ),
    );

    return {
      message: `Upload thành công ${images.length} ảnh`,
      images,
    };
  }

  async update(id: string, dto: UpdateProductImageDto) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Ảnh không tồn tại');

    // Nếu set isPrimary = true → bỏ primary của ảnh cũ
    if (dto.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: image.productId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Ảnh không tồn tại');

    // Xóa ảnh trên Cloudinary
    await this.cloudinary.deleteImage(image.url);

    // Xóa trong DB
    return this.prisma.productImage.delete({ where: { id } });
  }
}
