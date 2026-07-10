import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const url = await this.cloudinary.uploadImage(file, 'avatars');
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: { id: true, avatarUrl: true },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    // Nếu set default → bỏ default cũ
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { ...dto, userId },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: CreateAddressDto,
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address)
      throw new ForbiddenException('Không có quyền sửa địa chỉ này');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address)
      throw new ForbiddenException('Không có quyền xóa địa chỉ này');
    return this.prisma.address.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address)
      throw new ForbiddenException('Không có quyền thay đổi địa chỉ này');

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
