import api from "./api";
import { AuthResponse, User } from "@/types";

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  login: (dto: LoginDto) => api.post<AuthResponse>("/auth/login", dto),

  register: (dto: RegisterDto) => api.post<AuthResponse>("/auth/register", dto),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }),

  getMe: () => api.get<User>("/auth/me"), // ← cần tạo endpoint này ở backend
};
