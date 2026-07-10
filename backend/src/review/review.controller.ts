import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: string) {
    return this.reviewService.findApprovedReviews(productId);
  }

  @Get('product/:productId/order/:orderId')
  getProductReviewByOrder(
    @Param('productId') productId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.reviewService.findByProductAndOrder(productId, orderId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.reviewService.remove(id, userId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approve(@Param('id') id: string) {
    return this.reviewService.approveReview(id);
  }

  // admin role
  // Lấy tất cả reviews (admin)
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllReviews(@Query('isVerified') isVerified?: string) {
    return this.reviewService.getAllReviews(isVerified);
  }

  // Duyệt review
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approveReview(@Param('id') id: string) {
    return this.reviewService.approveReview(id);
  }
}
