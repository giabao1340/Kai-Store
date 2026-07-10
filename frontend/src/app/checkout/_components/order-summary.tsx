"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Cart } from "@/types";
import api from "@/services/api";
import { toast } from "sonner";

interface OrderSummaryProps {
  cart: Cart;
  onCouponApply: (code: string, discount: number) => void;
  couponCode: string;
  discountAmount: number;
  isSubmitting: boolean;
}

export default function OrderSummary({
  cart,
  onCouponApply,
  couponCode,
  discountAmount,
  isSubmitting,
}: OrderSummaryProps) {
  const [code, setCode] = useState(couponCode);
  const [isChecking, setIsChecking] = useState(false);

  const subtotal = cart.total ?? 0;
  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    try {
      // Gọi API validate coupon
      const coupon = await api.get<any>(`/coupons/validate/${code}`);
      let discount = 0;

      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount)
          discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }

      onCouponApply(code, discount);
      toast.success(`Áp dụng thành công! Giảm ${formatPrice(discount)}`);
    } catch {
      toast.error("Mã coupon không hợp lệ hoặc đã hết hạn");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 sticky top-24">
      <h2 className="text-lg font-semibold">Order summary</h2>

      {/* Promo code */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
          <Tag className="w-4 h-4" />
          <span>Promo code</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter code (e.g. WELCOME10)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="rounded-xl text-sm"
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={isChecking || !code.trim()}
            variant="outline"
            className="rounded-xl px-4 text-sm flex-shrink-0"
          >
            {isChecking ? "..." : "Apply"}
          </Button>
        </div>
        {discountAmount > 0 && (
          <p className="text-xs text-green-600">
            Giảm {formatPrice(discountAmount)}
          </p>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Chi tiết giá */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span className="line-through text-gray-400">
            {formatPrice(subtotal)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Discount:</span>
            <span className="text-green-600">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping fee:</span>
          <span className="line-through text-gray-400">đ0</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Quantity:</span>
          <span>{totalQuantity}</span>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-900">Total:</span>
        <span className="text-xl font-bold text-blue-600">
          {formatPrice(total)}
        </span>
      </div>

      {/* Submit button — được trigger từ form */}
      <Button
        type="submit"
        form="checkout-form"
        disabled={isSubmitting}
        className="w-full rounded-full h-12 text-base bg-blue-500 hover:bg-blue-600"
      >
        {isSubmitting ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
}
