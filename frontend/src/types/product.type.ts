export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brandId: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: Brand;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}
