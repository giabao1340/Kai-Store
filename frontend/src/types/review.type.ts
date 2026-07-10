export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
