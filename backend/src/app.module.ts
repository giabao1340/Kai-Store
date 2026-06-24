import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ProductImageModule } from './product-image/product-image.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CouponModule } from './coupon/coupon.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    ProductVariantModule,
    ProductImageModule,
    CloudinaryModule,
    CouponModule,
    CartModule,
    OrderModule,
    ReviewModule,
    PaymentModule,
    UserModule,
  ],
})
export class AppModule {}
