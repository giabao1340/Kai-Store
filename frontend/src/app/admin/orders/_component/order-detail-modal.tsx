"use client";

import { useState } from "react";
import { X, MapPin, CreditCard, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { orderService } from "@/services/order.service";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền",
};

export default function OrderDetailModal({
  order,
  onClose,
  onUpdated,
}: OrderDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled =
    order.status === "CANCELLED" || order.status === "REFUNDED";

  const handleUpdateStatus = async (status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await orderService.updateStatus(order.id, status);
      toast.success(`Đã cập nhật trạng thái: ${STATUS_LABEL[status]}`);
      onUpdated();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Không thể cập nhật trạng thái",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold text-gray-900">
              #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Cập nhật trạng thái */}
          {!isCancelled ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Cập nhật trạng thái
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((status, index) => {
                  const isPast = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isDisabled = index < currentIndex || isUpdating;

                  return (
                    <button
                      key={status}
                      onClick={() => !isDisabled && handleUpdateStatus(status)}
                      disabled={isDisabled}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        isCurrent
                          ? "bg-black text-white border-black"
                          : isPast
                            ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
                      )}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-600 font-medium">
                {STATUS_LABEL[order.status]}
              </p>
            </div>
          )}

          {/* Sản phẩm */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                Sản phẩm ({order.items.length})
              </p>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.snapProductName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.snapColor} · Size {item.snapSize} · x{item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                Địa chỉ giao hàng
              </p>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">
                {order.snapFullName} · {order.snapPhone}
              </p>
              <p>
                {order.snapStreet}, {order.snapWard}, {order.snapDistrict},{" "}
                {order.snapProvince}
              </p>
            </div>
          </div>

          {/* Thanh toán */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">Thanh toán</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Phương thức</span>
                <span className="text-gray-900">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Trạng thái</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    order.payment?.status === "PAID"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700",
                  )}
                >
                  {order.payment?.status}
                </span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(Number(order.totalAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 pt-1">
                <span>Tổng cộng</span>
                <span>{formatPrice(Number(order.finalAmount))}</span>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Ghi chú</p>
              <p className="text-sm text-gray-700">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
