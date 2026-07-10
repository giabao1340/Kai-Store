"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderCard from "./_components/order-card";
import useAuthStore from "@/stores/auth.store";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";

const TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Đang giao", value: "SHIPPING" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Đơn hàng của tôi</h1>

      {/* Tabs filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Danh sách đơn hàng */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24">
          <Package className="w-16 h-16 text-gray-200" />
          <p className="text-gray-400 text-sm">Chưa có đơn hàng nào</p>
          <Button asChild className="rounded-full px-8">
            <Link href="/products">Mua sắm ngay</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
