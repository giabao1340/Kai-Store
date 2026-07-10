import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface AdminOrderRowProps {
  order: Order;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
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
  REFUNDED: { label: "Hoàn tiền", bg: "bg-gray-50", text: "text-gray-700" },
};

export default function AdminOrderRow({ order, onClick }: AdminOrderRowProps) {
  const status = STATUS_CONFIG[order.status];

  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        #{order.id.slice(-8).toUpperCase()}
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{order.snapFullName}</td>
      <td className="py-3 px-4 text-sm text-gray-400">{order.snapPhone}</td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {order.items.length} sản phẩm
      </td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        {formatPrice(Number(order.finalAmount))}
      </td>
      <td className="py-3 px-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            status.bg,
            status.text,
          )}
        >
          {status.label}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400">
        {formatDate(order.createdAt)}
      </td>
    </tr>
  );
}
