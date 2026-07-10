"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ShoppingBag,
  Tag,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/services/api";
import Link from "next/link";
import { orderService } from "@/services/order.service";

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalBrands: number;
  totalCoupons: number;
  recentOrders: any[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-blue-50", text: "text-blue-700" },
  SHIPPING: { label: "Đang giao", bg: "bg-purple-50", text: "text-purple-700" },
  DELIVERED: { label: "Đã giao", bg: "bg-green-50", text: "text-green-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700" },
};

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStats();
  }, []);

  const { getAll } = orderService;
  const fetchStats = async () => {
    try {
      const [orders, products, brands, coupons] = await Promise.all([
        getAll(),
        api.get<any[]>("/products"),
        api.get<any[]>("/brands"),
        api.get<any[]>("/coupons"),
      ]);

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalBrands: brands.length,
        totalCoupons: coupons.length,
        recentOrders: orders, // ← lấy hết, phân trang ở dưới
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recentOrders = stats?.recentOrders ?? [];
  const totalPages = Math.max(1, Math.ceil(recentOrders.length / PAGE_SIZE));
  const paginated = useMemo(
    () => recentOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [recentOrders, page],
  );

  const STAT_CARDS = [
    {
      label: "Đơn hàng",
      value: stats?.totalOrders,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      text: "text-blue-600",
      url: "/admin/orders",
    },
    {
      label: "Sản phẩm",
      value: stats?.totalProducts,
      icon: Package,
      bg: "bg-green-50",
      text: "text-green-600",
      url: "/admin/products",
    },
    {
      label: "Thương hiệu",
      value: stats?.totalBrands,
      icon: Tag,
      bg: "bg-purple-50",
      text: "text-purple-600",
      url: "/admin/brands",
    },
    {
      label: "Mã giảm giá",
      value: stats?.totalCoupons,
      icon: Ticket,
      bg: "bg-orange-50",
      text: "text-orange-600",
      url: "/admin/coupons",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.url}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${card.text}`} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value ?? 0}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">
          Đơn hàng gần đây
        </p>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Chưa có đơn hàng
          </p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Mã đơn
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Khách hàng
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Tổng tiền
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 pb-3">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => {
                  const status = STATUS_CONFIG[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 font-medium">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 text-gray-500">
                        {order.snapFullName}
                      </td>
                      <td className="py-3">
                        {Number(order.finalAmount).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${status?.bg} ${status?.text}`}
                        >
                          {status?.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Trang {page}/{totalPages} ({recentOrders.length} đơn hàng)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
