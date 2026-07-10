"use client";

import { Truck, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodProps {
  selected: "COD" | "VIETQR";
  onChange: (method: "COD" | "VIETQR") => void;
}

export default function PaymentMethod({
  selected,
  onChange,
}: PaymentMethodProps) {
  const methods = [
    {
      id: "COD" as const,
      label: "Thanh toán khi nhận hàng",
      description: "Trả tiền mặt khi nhận được đơn hàng",
      icon: Truck,
    },
    {
      id: "VIETQR" as const,
      label: "Chuyển khoản VietQR",
      description: "Quét mã QR bằng app ngân hàng",
      icon: QrCode,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Payment method</h3>
      <div className="grid grid-cols-2 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-colors",
                selected === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 hover:border-gray-200",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  selected === method.id ? "text-blue-500" : "text-gray-400",
                )}
              />
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    selected === method.id ? "text-blue-600" : "text-gray-700",
                  )}
                >
                  {method.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {method.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
