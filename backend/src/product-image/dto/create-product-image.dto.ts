import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateProductImageDto {
  @IsString()
  productId: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
