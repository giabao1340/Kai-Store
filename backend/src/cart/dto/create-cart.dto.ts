import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class AddToCartDto {
  @IsNotEmpty()
  @IsString()
  variantId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
