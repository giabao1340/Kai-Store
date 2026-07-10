export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "STRIPE";

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  variant?: {
    productId: string; // ← thêm
  };
  snapProductName: string;
  snapSize: string;
  snapColor: string;
  snapSku: string;
  snapImageUrl?: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  couponId?: string;
  snapFullName: string;
  snapPhone: string;
  snapProvince: string;
  snapDistrict: string;
  snapWard: string;
  snapStreet: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  note?: string;
  items: OrderItem[];
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}
