import api from "./api";
import { ProductVariant } from "@/types";

export const variantService = {
  create: (dto: any) => api.post<ProductVariant>("/product-variants", dto),
  update: (id: string, dto: any) =>
    api.patch<ProductVariant>(`/product-variants/${id}`, dto),
  remove: (id: string) => api.delete(`/product-variants/${id}`),
};
