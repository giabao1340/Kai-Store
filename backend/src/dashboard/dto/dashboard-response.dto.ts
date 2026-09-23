export class DashboardKpiDto {
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

export class RevenuePointDto {
  date: string;
  revenue: number;
  orders: number;
}

export class OrderStatusDto {
  status: string;
  count: number;
}

export class TopProductDto {
  productId: string;
  productName: string;
  imageUrl: string | null;
  soldQuantity: number;
  revenue: number;
}

export class LowStockProductDto {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
}

export class RecentOrderDto {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export class PaymentMethodDto {
  method: string;
  count: number;
  revenue: number;
}

export class BrandRevenueDto {
  brandId: string;
  brandName: string;
  revenue: number;
  soldQuantity: number;
}

export class DashboardResponseDto {
  range: string;

  kpi: DashboardKpiDto;

  revenue: RevenuePointDto[];

  orderStatus: OrderStatusDto[];

  topProducts: TopProductDto[];

  lowStock: LowStockProductDto[];

  recentOrders: RecentOrderDto[];

  paymentMethods: PaymentMethodDto[];

  brandRevenue: BrandRevenueDto[];
}
