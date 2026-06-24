import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Post()
  createOrder(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get('my-orders')
  getMyOrders(@GetUser('id') userId: string) {
    return this.orderService.getMyOrders(userId);
  }

  @Get(':id')
  getOrderDetail(@GetUser('id') userId: string, @Param('id') orderId: string) {
    return this.orderService.getOrderDetail(userId, orderId);
  }

  @Patch(':id/cancel')
  cancelOrder(@GetUser('id') userId: string, @Param('id') orderId: string) {
    return this.orderService.cancelOrder(userId, orderId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') orderId: string, @Body() dto: UpdateStatusDto) {
    return this.orderService.updateOrderStatus(orderId, dto.status);
  }
}
