import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
