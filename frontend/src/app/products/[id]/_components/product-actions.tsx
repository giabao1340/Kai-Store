"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/auth.store";
import api from "@/services/api";
import useCartStore from "@/stores/cart.store";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách màu unique
  const colors = [...new Set(product.variants.map((v) => v.color))];

  // Lấy sizes theo màu đã chọn
  const availableSizes = selectedColor
    ? product.variants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size)
    : [...new Set(product.variants.map((v) => v.size))];

  // Lấy variant đang chọn
  const selectedVariant: ProductVariant | null =
    selectedColor && selectedSize
      ? (product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize,
        ) ?? null)
      : null;

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const maxQuantity = selectedVariant?.stock ?? 1;

  // Tính giá hiển thị
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Math.min(...product.variants.map((v) => Number(v.price)));

  const displayComparePrice = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn màu sắc và kích cỡ");
      return;
    }

    setIsLoading(true);
    try {
      await addToCart({
        // ← gọi qua store, store tự update
        variantId: selectedVariant.id,
        quantity,
      });
      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (selectedVariant) router.push("/cart");
  };

  return (
    <div className="space-y-6">
      {/* Giá */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold">
          {formatPrice(displayPrice)}
        </span>
        {displayComparePrice && (
          <>
            <span className="text-gray-400 line-through text-base">
              {formatPrice(displayComparePrice)}
            </span>
            <span className="text-red-500 text-sm font-medium">
              -{Math.round((1 - displayPrice / displayComparePrice) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Chọn màu */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Màu sắc
          {selectedColor && (
            <span className="ml-2 text-gray-500 font-normal">
              — {selectedColor}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize(null); // reset size khi đổi màu
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                selectedColor === color
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-400",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn size */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Kích cỡ
          {selectedSize && (
            <span className="ml-2 text-gray-500 font-normal">
              — EU {selectedSize}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const variant = product.variants.find(
              (v) =>
                v.size === size &&
                (!selectedColor || v.color === selectedColor),
            );
            const outOfStock = (variant?.stock ?? 0) === 0;

            return (
              <button
                key={size}
                onClick={() => !outOfStock && setSelectedSize(size)}
                disabled={outOfStock}
                className={cn(
                  "w-12 h-12 rounded-lg border text-sm font-medium transition-colors",
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : outOfStock
                      ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                      : "border-gray-200 text-gray-700 hover:border-gray-400",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Số lượng */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Số lượng</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          {selectedVariant && (
            <span className="text-xs text-gray-400">
              Còn {selectedVariant.stock} sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          variant="outline"
          className="flex-1 rounded-full border-black"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isLoading || isOutOfStock}
          className="flex-1 rounded-full bg-black hover:bg-gray-800"
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
