import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

// Tất cả route đều cần đăng nhập
@UseGuards(JwtAuthGuard)
@Roles(Role.USER) // Chỉ user mới được thao tác cart
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Lấy giỏ hàng của user hiện tại
  @Get()
  getCart(@GetUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  // Thêm sản phẩm vào giỏ
  @Post('items')
  addToCart(@GetUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  // Cập nhật số lượng item
  @Patch('items/:itemId')
  updateCartItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, itemId, dto);
  }

  // Xóa 1 item khỏi giỏ
  @Delete('items/:itemId')
  removeCartItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeCartItem(userId, itemId);
  }

  // Xóa toàn bộ giỏ
  @Delete()
  clearCart(@GetUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
