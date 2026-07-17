"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function ConfirmOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const action = searchParams.get("action") ?? "confirm";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    confirmOrder();
  }, [token]);

  const confirmOrder = async () => {
    try {
      const res = await api.get<{
        success: boolean;
        message: string;
        orderId: string;
      }>(`/orders/confirm?token=${token}&action=${action}`);

      setOrderId(res.orderId);
      setMessage(res.message);
      setStatus(res.success ? "success" : "error");
    } catch {
      setStatus("error");
      setMessage("Có lỗi xảy ra");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Đang xử lý...</p>
          </>
        )}

        {status === "success" && action !== "cancel" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Xác nhận thành công!
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Button
              onClick={() => router.push(`/orders/${orderId}`)}
              className="w-full rounded-full"
            >
              Xem đơn hàng
            </Button>
          </>
        )}

        {(status === "error" || action === "cancel") && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {action === "cancel" ? "Đã hủy đơn hàng" : "Có lỗi xảy ra"}
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full rounded-full"
            >
              Về trang chủ
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
