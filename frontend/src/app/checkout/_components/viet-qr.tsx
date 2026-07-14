"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import api from "@/services/api";

const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID ?? "ICB";
const ACCOUNT_NO = process.env.NEXT_PUBLIC_ACCOUNT_NO ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_ACCOUNT_NAME ?? "KAI STORE";

interface VietQRProps {
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export default function VietQR({
  orderId,
  amount,
  onPaymentSuccess,
}: VietQRProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 60; // 5 phút

  const description = `SEVQR ${orderId.slice(-8).toUpperCase()}`;

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png` +
    `?amount=${amount}` +
    `&addInfo=${encodeURIComponent(description)}` +
    `&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setIsChecking(false);
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
          setIsPaid(true);
          setIsChecking(false);

          // Đợi 1.5s để hiện animation success rồi mới redirect
          setTimeout(() => {
            onPaymentSuccess();
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }

      setAttempts((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, attempts]);

  // Hiện màn hình thành công
  if (isPaid) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-lg font-semibold text-gray-900">
          Thanh toán thành công!
        </p>
        <p className="text-sm text-gray-400">Đang chuyển đến đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
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
            unoptimized // ← ảnh dynamic từ API
          />
        </div>
      </div>

      {/* Thông tin chuyển khoản */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Số tài khoản</p>
          <p className="font-semibold text-sm">{ACCOUNT_NO}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Chủ tài khoản</p>
          <p className="font-semibold text-sm">{ACCOUNT_NAME}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Số tiền</p>
          <p className="font-semibold text-sm text-blue-600">
            {formatPrice(amount)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Nội dung CK</p>
          <p className="font-semibold text-sm font-mono">{description}</p>
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
          Mở link thanh toán
        </Button>

        {isChecking && (
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              Đang chờ thanh toán... (
              {Math.floor(((MAX_ATTEMPTS - attempts) * 5) / 60)} phút còn lại)
            </span>
          </div>
        )}

        {!isChecking && !isPaid && (
          <p className="text-sm text-red-400">
            Hết thời gian chờ. Vui lòng{" "}
            <button
              className="underline"
              onClick={() => {
                setAttempts(0);
                setIsChecking(true);
              }}
            >
              thử lại
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
