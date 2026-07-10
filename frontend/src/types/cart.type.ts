import { ProductVariant, Product, ProductImage } from "./product.type";

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & {
    product: Product & {
      images: ProductImage[];
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}
