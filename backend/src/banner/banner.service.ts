import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.banner.findMany({
      where: search ? { title: { contains: search, mode: 'insensitive' } } : {},
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner không tồn tại');
    return banner;
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({ where: { id } }); // ← xóa thật, không trả string
  }

  async updateBanner(id: string, imageUrl: string) {
    await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data: { imageUrl } });
  }
}