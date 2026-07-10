import { AxiosError } from "axios";

// Lấy message lỗi từ response của NestJS
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;

    // NestJS trả về { message: string | string[] }
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message[0]; // lấy lỗi đầu tiên
      }
      return data.message;
    }
  }

  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra";
}

// Format tiền VND
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

// Format ngày
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

// Merge classnames (dùng với Tailwind)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
