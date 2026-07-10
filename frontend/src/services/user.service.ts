import api from "./api";
import { User, Address } from "@/types";

export const userService = {
  getProfile: () => api.get<User>("/users/profile"),

  updateProfile: (dto: Partial<Pick<User, "name" | "email" | "phone">>) =>
    api.patch<User>("/users/profile", dto),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ avatarUrl: string }>("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAddresses: () => api.get<Address[]>("/users/addresses"),

  createAddress: (dto: Omit<Address, "id" | "userId">) =>
    api.post<Address>("/users/addresses", dto),

  updateAddress: (id: string, dto: Partial<Address>) =>
    api.patch<Address>(`/users/addresses/${id}`, dto),

  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    api.patch(`/users/addresses/${id}/default`),
};
