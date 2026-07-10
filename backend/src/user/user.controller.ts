import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './user.service';
import { CreateAddressDto } from './dto/create-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  // ── Địa chỉ ───────────────────────────────────────
  @Get('addresses')
  getAddresses(@GetUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  createAddress(@GetUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  deleteAddress(@GetUser('id') userId: string, @Param('id') addressId: string) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  @Patch('addresses/:id/default')
  setDefaultAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.setDefaultAddress(userId, addressId);
  }
}
