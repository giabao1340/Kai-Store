"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import api from "@/services/api";

// VietQR public API — miễn phí, không cần key
// Docs: https://vietqr.io/danh-sach-api/tao-ma-qr/
const BANK_ID = "vietcombank"; // Mã ngân hàng của bạn
const ACCOUNT_NO = "1031798735"; // Số tài khoản của bạn
const ACCOUNT_NAME = "LUONG GIA BAO"; // Tên tài khoản

interface VietQRProps {
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}
interface OrderResponse {
  payment?: {
    status: "PENDING" | "PAID" | "FAILED";
  };
}

export default function VietQR({
  orderId,
  amount,
  onPaymentSuccess,
}: VietQRProps) {
  const [isChecking, setIsChecking] = useState(false);

  // Nội dung chuyển khoản là mã đơn hàng
  const description = `KAI ${orderId.slice(-8).toUpperCase()}`;

  // Generate QR URL từ VietQR
  const qrUrl =
    `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png` +
    `?amount=${amount}` +
    `&addInfo=${encodeURIComponent(description)}` +
    `&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // Polling check payment mỗi 5 giây
  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // polling tối đa 5 phút

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await api.get<{
          isPaid: boolean;
          status: string;
          paidAt: string;
        }>(`/payments/${orderId}/status`);

        if (res.isPaid) {
          clearInterval(interval);
          onPaymentSuccess();
        }
      } catch {}
    }, 5000); // check mỗi 5 giây

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-medium text-gray-900">Quét mã QR để thanh toán</h3>
        <p className="text-sm text-gray-400">
          Dùng app ngân hàng quét mã bên dưới
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="border-2 border-blue-400 rounded-2xl p-3 bg-white">
          <Image
            src={qrUrl}
            alt="VietQR Payment"
            width={220}
            height={220}
            className="rounded-xl"
          />
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Please scan the QR code with your banking app
      </p>

      {/* Thông tin chuyển khoản */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Account number</p>
          <p className="font-semibold text-sm">{ACCOUNT_NO}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Account holder</p>
          <p className="font-semibold text-sm">{ACCOUNT_NAME}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Amount</p>
          <p className="font-semibold text-sm text-blue-600">
            {formatPrice(amount)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Nội dung CK</p>
          <p className="font-semibold text-sm">{description}</p>
        </div>
      </div>

      {/* Open payment link */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() =>
            window.open(
              `https://dl.vietqr.io/pay?app=vietqr&ba=${BANK_ID}-${ACCOUNT_NO}&am=${amount}&tn=${description}`,
              "_blank",
            )
          }
        >
          Open payment link
        </Button>

        <div className="flex items-center gap-2 text-sm text-blue-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Checking payment...</span>
        </div>
      </div>
    </div>
  );
}
