import api from "./api";
import { Order, OrderStatus } from "@/types";

export const orderService = {
  getMyOrders: () => api.get<Order[]>("/orders/my-orders"),

  getOne: (id: string) => api.get<Order>(`/orders/${id}`),

  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),

  // ── Admin ──────────────────────────────────────────
  getAll: () => api.get<Order[]>("/orders/admin/all"),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
};
