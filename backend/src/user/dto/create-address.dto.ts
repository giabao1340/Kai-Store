import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  street: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
