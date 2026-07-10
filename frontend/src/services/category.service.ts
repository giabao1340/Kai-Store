import api from "./api";
import { Category } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE_URL}/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const categoryService = {
  getAll: () => api.get<Category[]>("/categories"),
  getOne: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (dto: any) => api.post<Category>("/categories", dto),
  update: (id: string, dto: any) =>
    api.patch<Category>(`/categories/${id}`, dto),
  remove: (id: string) => api.delete(`/categories/${id}`),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Category>(`/categories/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
