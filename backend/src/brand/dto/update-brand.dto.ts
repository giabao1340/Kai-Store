import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

// PartialType tự động làm tất cả field thành optional
export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
