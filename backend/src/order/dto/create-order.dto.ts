import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  // Địa chỉ giao hàng
  @IsString()
  snapFullName: string;

  @IsString()
  snapPhone: string;

  @IsString()
  snapProvince: string;

  @IsString()
  snapDistrict: string;

  @IsString()
  snapWard: string;

  @IsString()
  snapStreet: string;

  // Phương thức thanh toán
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Optional
  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
