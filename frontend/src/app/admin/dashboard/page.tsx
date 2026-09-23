"use client";

import { useEffect, useState } from "react";

import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DashboardRange, DashboardResponse } from "@/types/dashboard";

import { dashboardService } from "@/services/dashboard.service";

import { formatCurrency, formatNumber } from "@/lib/utils";

import { StatCard } from "@/components/admin/dashboard/stat-card";

import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";

import { OrderStatusChart } from "@/components/admin/dashboard/order-status-chart";

import { TopProducts } from "@/components/admin/dashboard/top-products";

import { LowStock } from "@/components/admin/dashboard/low-stock";

import { RecentOrders } from "@/components/admin/dashboard/recent-orders";

import { PaymentMethods } from "@/components/admin/dashboard/payment-methods";

import { BrandRevenueChart } from "@/components/admin/dashboard/brand-revenue";

export default function DashboardPage() {
  const [range, setRange] = useState<DashboardRange>("30d");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getDashboard(range);

      setDashboard(data);
    } catch (error) {
      console.error(error);

      setError("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Đang tải dashboard...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>

          <Button className="mt-4" onClick={fetchDashboard}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    kpi,
    revenue,
    orderStatus,
    topProducts,
    lowStock,
    recentOrders,
    paymentMethods,
    brandRevenue,
  } = dashboard;

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

          <p className="text-muted-foreground">
            Tổng quan hoạt động của Kai Store
          </p>
        </div>

        <div className="flex gap-2">
          {[
            ["7d", "7 ngày"],
            ["30d", "30 ngày"],
            ["3m", "3 tháng"],
            ["6m", "6 tháng"],
            ["1y", "1 năm"],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={range === value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(value as DashboardRange)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Doanh thu"
          value={formatCurrency(kpi.revenue)}
          growth={kpi.revenueGrowth}
          icon={<DollarSign className="h-5 w-5" />}
        />

        <StatCard
          title="Đơn hàng"
          value={formatNumber(kpi.orders)}
          growth={kpi.ordersGrowth}
          icon={<ShoppingCart className="h-5 w-5" />}
        />

        <StatCard
          title="Khách hàng mới"
          value={formatNumber(kpi.customers)}
          growth={kpi.customersGrowth}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Sản phẩm"
          value={formatNumber(kpi.products)}
          icon={<Package className="h-5 w-5" />}
        />
      </div>
      {/* EXTRA KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Giá trị đơn trung bình"
          value={formatCurrency(kpi.averageOrderValue)}
          icon={<ShoppingCart className="h-5 w-5" />}
        />

        <StatCard
          title="Sản phẩm sắp hết"
          value={formatNumber(kpi.lowStockProducts)}
          icon={<Package className="h-5 w-5" />}
        />

        <StatCard
          title="Hết hàng"
          value={formatNumber(kpi.outOfStockProducts)}
          icon={<Package className="h-5 w-5" />}
        />
      </div>
      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>

        <OrderStatusChart data={orderStatus} />
      </div>
      {/* PRODUCTS */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProducts data={topProducts} />
        </div>

        <LowStock data={lowStock} />
      </div>
      {/* ORDERS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders data={recentOrders} />

        <PaymentMethods data={paymentMethods} />
      </div>
      {/* BRAND */}
      <div>
        <BrandRevenueChart data={brandRevenue} />
      </div>
    </div>
  );
}
