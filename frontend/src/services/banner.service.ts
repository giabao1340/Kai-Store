import { Banner } from "@/types/banner.type";
import api from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// SSR — trang public
export async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${BASE_URL}/banners`, {
      // ← /banners không phải /banner
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Admin — dùng axios có token
export const bannerService = {
  // ← đổi tên bannerservice → bannerService (camelCase)
  getAll: () => api.get<Banner[]>("/banners"),
  getOne: (id: string) => api.get<Banner>(`/banners/${id}`),
  create: (dto: any) => api.post<Banner>("/banners", dto),
  update: (id: string, dto: any) => api.patch<Banner>(`/banners/${id}`, dto),
  remove: (id: string) => api.delete(`/banners/${id}`),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Banner>(`/banners/${id}/image`, formData);
  }
};
