"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types";
import OrderDetailModal from "./_component/order-detail-modal";
import AdminOrderRow from "./_component/admin-order-row";

const TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đang giao", value: "SHIPPING" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchTab = activeTab === "ALL" || order.status === activeTab;
      const matchSearch =
        !search ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.snapFullName.toLowerCase().includes(search.toLowerCase()) ||
        order.snapPhone.includes(search);
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, search]);

  // ── Pagination ──────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset về trang 1 khi đổi filter/search
  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  // Nếu trang hiện tại vượt quá tổng số trang (VD: vừa xóa hết item) → kéo về trang cuối
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const handleModalClose = () => setSelectedOrder(null);

  const handleUpdated = async () => {
    await fetchOrders();
    const updated = orders.find((o) => o.id === selectedOrder?.id);
    if (updated) setSelectedOrder(updated);
    else setSelectedOrder(null);
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Không có đơn hàng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Mã đơn
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Khách hàng
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      SĐT
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Sản phẩm
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Tổng tiền
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Trạng thái
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Ngày đặt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order) => (
                    <AdminOrderRow
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} trong{" "}
                {filtered.length} đơn hàng
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Số trang */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Chỉ hiện trang gần page hiện tại để tránh quá nhiều nút
                      if (totalPages <= 7) return true;
                      return (
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1
                      );
                    })
                    .map((p, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const showEllipsis = prevP && p - prevP > 1;
                      return (
                        <span key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="text-gray-300 text-xs px-1">
                              …
                            </span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                              p === page
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleModalClose}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
