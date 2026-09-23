import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ProductModule } from '../product/product.module';
import { ProductService } from '../product/product.service';
import { BrandModule } from '../brand/brand.module';
import { BrandService } from '../brand/brand.service';

@Module({
  imports: [ProductModule, BrandModule],
  controllers: [AiController],
  providers: [AiService, ProductService, BrandService],
})
export class AiModule {}
