import api from "./api";
import { ProductImage } from "@/types";

export const imageService = {
  upload: (productId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post<{ images: ProductImage[] }>(
      `/product-images/${productId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
  update: (id: string, dto: Partial<ProductImage>) =>
    api.patch<ProductImage>(`/product-images/${id}`, dto),
  remove: (id: string) => api.delete(`/product-images/${id}`),
};
