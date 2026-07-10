import api from "./api";

export interface CreateReviewDto {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    email?: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export const reviewService = {
  // Lấy reviews của 1 sản phẩm (đã được duyệt)
  getByProduct: (productId: string) =>
    api.get<Review[]>(`/reviews/product/${productId}`),
  // Lấy review của 1 sản phẩm theo orderId
  getByProductAndOrder: (productId: string, orderId: string) =>
    api.get<Review>(`/reviews/product/${productId}/order/${orderId}`),

  // Tạo review mới
  create: (dto: CreateReviewDto) => api.post<Review>("/reviews", dto),

  // Cập nhật review
  update: (id: string, dto: Partial<CreateReviewDto>) =>
    api.patch<Review>(`/reviews/${id}`, dto),

  // Xóa review
  remove: (id: string) => api.delete(`/reviews/${id}`),

  // Admin
  getAll: (isVerified?: boolean) =>
    api.get<Review[]>("/reviews/all", {
      params: isVerified !== undefined ? { isVerified } : {},
    }),

  approve: (id: string) => api.patch<Review>(`/reviews/${id}/approve`),
};
