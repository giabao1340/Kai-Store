import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  size: string; // size là "39", "40"... nên là string

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
