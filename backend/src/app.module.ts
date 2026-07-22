import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { BannerModule } from './banner/banner.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 giây
        limit: 3, // tối đa 3 request
      },
      {
        name: 'medium',
        ttl: 60000, // 1 phút
        limit: 20, // tối đa 20 request
      },
    ]),
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
    BannerModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // áp dụng toàn bộ app
    },
  ],
})
export class AppModule {}
