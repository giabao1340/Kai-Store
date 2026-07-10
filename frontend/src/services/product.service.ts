import api from "./api";
import { Product } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ProductQuery {
  search?: string;
  isFeatured?: string;
  brandId?: string;
  categoryId?: string;
  page?: string;
  limit?: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchProducts(
  query?: ProductQuery,
): Promise<PaginatedProducts> {
  try {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.isFeatured) params.set("isFeatured", query.isFeatured);
    if (query?.brandId) params.set("brandId", query.brandId);
    if (query?.categoryId) params.set("categoryId", query.categoryId);
    if (query?.page) params.set("page", query.page);
    if (query?.limit) params.set("limit", query.limit);

    const url = `${BASE_URL}/products?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok)
      return { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
    const data = await res.json();
    return {
      ...data,
      items: Array.isArray(data.items) ? data.items : [],
    }; // fix bug
  } catch {
    return { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
  }
}

export async function fetchProductsSimple(
  query?: ProductQuery,
): Promise<Product[]> {
  const result = await fetchProducts(query);
  return result.items;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
// ── Admin (client, dùng axios có token) ──────────────

export const productAdminService = {
  getAll: (query?: ProductQuery) =>
    api.get<PaginatedProducts>("/products", {
      params: { ...query, includeHidden: "true" },
    }),

  getOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (dto: any) => api.post<Product>("/products", dto),
  update: (id: string, dto: any) => api.patch<Product>(`/products/${id}`, dto),
  remove: (id: string) => api.delete(`/products/${id}`),
};
