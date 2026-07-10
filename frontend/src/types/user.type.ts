export type Role = "User" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
