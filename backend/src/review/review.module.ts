import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [ProductModule, OrderModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
