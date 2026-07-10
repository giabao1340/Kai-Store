import { Product } from "./product.type";

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;

  productId?: string;
  product?: Product;

  collection?: string;
  isActive: boolean;
  order: number;

  description?: string;

  createdAt: string;
  updatedAt: string;
}
