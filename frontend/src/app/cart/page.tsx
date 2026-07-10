"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartSummary from "./_components/cart-summary";
import useCartStore from "@/stores/cart.store";
import useAuthStore from "@/stores/auth.store";
import CartItem from "./_components/cart-items";

export default function CartPage() {
  const { cart, isLoading, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <ShoppingBag className="w-16 h-16 text-gray-200" />
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="text-gray-400 text-sm text-center">
          Đăng nhập để xem giỏ hàng của bạn
        </p>
        <Button asChild className="rounded-full px-8">
          <Link href="/auth">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-28 h-28 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Giỏ trống
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center gap-4">
        <ShoppingBag className="w-16 h-16 text-gray-200" />
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
        <p className="text-gray-400 text-sm">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Button asChild className="rounded-full px-8">
          <Link href="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cột trái — Bag */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold mb-6">Bag</h1>
          <div>
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Cột phải — Summary */}
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
