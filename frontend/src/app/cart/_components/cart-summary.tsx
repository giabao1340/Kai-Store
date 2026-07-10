"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import useCartStore from "@/stores/cart.store";
import useAuthStore from "@/stores/auth.store";

export default function CartSummary() {
  const router = useRouter();
  const { cart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = cart?.total ?? 0;
  const shipping = 0; // Free shipping

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="sticky top-24 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Summary</h2>

      <div className="space-y-3 py-4 border-t border-gray-100">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-700">Subtotal</span>
            <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-400 cursor-help">
              ?
            </div>
          </div>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Estimated Delivery & Handling</span>
          <span className="text-gray-700">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between py-4 border-t border-gray-200">
        <span className="font-semibold text-gray-900">Total</span>
        <span className="font-semibold text-gray-900">
          {formatPrice(subtotal + shipping)}
        </span>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        {!isAuthenticated ? (
          <>
            <Button
              onClick={() => router.push("/auth")}
              className="w-full rounded-full bg-black hover:bg-gray-800 h-12 text-base"
            >
              Guest Checkout
            </Button>
            <Button
              onClick={() => router.push("/auth")}
              className="w-full rounded-full bg-black hover:bg-gray-800 h-12 text-base"
            >
              Member Checkout
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCheckout}
            disabled={!cart || cart.items.length === 0}
            className="w-full rounded-full bg-black hover:bg-gray-800 h-12 text-base"
          >
            Checkout
          </Button>
        )}
      </div>
    </div>
  );
}
