import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-blue-600 bg-blue-50" },
  SHIPPING: { label: "Đang giao", color: "text-purple-600 bg-purple-50" },
  DELIVERED: { label: "Đã giao", color: "text-green-600 bg-green-50" },
  CANCELLED: { label: "Đã hủy", color: "text-red-600 bg-red-50" },
  REFUNDED: { label: "Hoàn tiền", color: "text-gray-600 bg-gray-50" },
};

export default function OrderCard({ order }: OrderCardProps) {
  const status = STATUS_CONFIG[order.status];
  const firstItem = order.items?.[0];

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-4">
          {/* Icon + info */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                #{order.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(order.createdAt)}
              </p>
              {firstItem && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {firstItem.snapProductName}
                  {order.items.length > 1 &&
                    ` +${order.items.length - 1} sản phẩm`}
                </p>
              )}
            </div>
          </div>

          {/* Giá + status */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(Number(order.finalAmount))}
            </span>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                status.color,
              )}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-end mt-3">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}
