export type DashboardRange = "7d" | "30d" | "3m" | "6m" | "1y";

export interface DashboardKpi {
  revenue: number;
  previousRevenue: number;
  revenueGrowth: number;

  orders: number;
  previousOrders: number;
  ordersGrowth: number;

  customers: number;
  previousCustomers: number;
  customersGrowth: number;

  products: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  averageOrderValue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatus {
  status: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  imageUrl?: string | null;
  soldQuantity: number;
  revenue: number;
}

export interface LowStockProduct {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
}

export interface RecentOrder {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface PaymentMethod {
  method: string;
  count: number;
  revenue: number;
}

export interface BrandRevenue {
  brandId: string;
  brandName: string;
  revenue: number;
  soldQuantity: number;
}

export interface DashboardResponse {
  range: DashboardRange;

  kpi: DashboardKpi;

  revenue: RevenuePoint[];

  orderStatus: OrderStatus[];

  topProducts: TopProduct[];

  lowStock: LowStockProduct[];

  recentOrders: RecentOrder[];

  paymentMethods: PaymentMethod[];

  brandRevenue: BrandRevenue[];
}
