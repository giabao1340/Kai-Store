import api from "./api";
import { Brand } from "@/types";

// SSR — dùng cho trang public
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${BASE_URL}/brands`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Admin
export const brandService = {
  getAll: () => api.get<Brand[]>("/brands"),
  getOne: (id: string) => api.get<Brand>(`/brands/${id}`),
  create: (dto: any) => api.post<Brand>("/brands", dto),
  update: (id: string, dto: any) => api.patch<Brand>(`/brands/${id}`, dto),
  remove: (id: string) => api.delete(`/brands/${id}`),
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Brand>(`/brands/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
