import { Check } from "lucide-react";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface OrderStatusProps {
  status: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  {
    status: "PENDING",
    label: "Chờ xác nhận",
    description: "Đơn hàng đang chờ xác nhận",
  },
  {
    status: "CONFIRMED",
    label: "Đã xác nhận",
    description: "Đơn hàng đã được xác nhận",
  },
  {
    status: "SHIPPING",
    label: "Đang giao",
    description: "Đơn hàng đang trên đường giao",
  },
  {
    status: "DELIVERED",
    label: "Đã giao",
    description: "Đơn hàng đã được giao thành công",
  },
];

const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

export default function OrderStatusTimeline({ status }: OrderStatusProps) {
  // Đơn bị hủy → hiện trạng thái riêng
  if (status === "CANCELLED" || status === "REFUNDED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-sm">✕</span>
        </div>
        <div>
          <p className="text-sm font-medium text-red-700">
            {status === "CANCELLED"
              ? "Đơn hàng đã bị hủy"
              : "Đơn hàng đã hoàn tiền"}
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEP_ORDER.indexOf(status);

  return (
    <div className="relative">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex gap-4 relative">
            {/* Line kết nối */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-0.5 h-10",
                  isDone ? "bg-black" : "bg-gray-100",
                )}
              />
            )}

            {/* Circle */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                isDone ? "bg-black" : "",
                isCurrent ? "bg-black" : "",
                !isDone && !isCurrent ? "bg-gray-100" : "",
              )}
            >
              {isDone ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isCurrent ? "bg-white" : "bg-gray-300",
                  )}
                />
              )}
            </div>

            {/* Text */}
            <div className="pb-10">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-black"
                    : isDone
                      ? "text-gray-600"
                      : "text-gray-300",
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  isCurrent ? "text-gray-500" : "text-gray-300",
                )}
              >
                {isCurrent ? step.description : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
