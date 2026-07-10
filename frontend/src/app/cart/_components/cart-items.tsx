"use client";

import Image from "next/image";
import { Trash2, Minus, Plus, Heart } from "lucide-react";
import { toast } from "sonner";
import { CartItem as CartItemType } from "@/types";
import { formatPrice } from "@/lib/utils";
import useCartStore from "@/stores/cart.store";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCartStore();

  const variant = item.variant;
  const product = variant?.product;
  const primaryImage =
    product?.images?.find((img) => img.isPrimary) ?? product?.images?.[0];

  const price = Number(variant?.price ?? 0);
  const comparePrice = variant?.compareAtPrice
    ? Number(variant.compareAtPrice)
    : null;

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > (variant?.stock ?? 1)) {
      toast.error(`Chỉ còn ${variant?.stock} sản phẩm`);
      return;
    }
    try {
      await updateItem(item.id, newQty);
    } catch {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item.id);
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="flex gap-4 py-6 border-b border-gray-100 last:border-0">
      {/* Ảnh sản phẩm */}
      <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product?.name ?? ""}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            👟
          </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          {/* Tên + thông tin */}
          <div>
            <h3 className="font-medium text-gray-900 text-sm leading-snug">
              {product?.name}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {product?.category?.name}
            </p>
            <p className="text-sm text-gray-400">{variant?.color}</p>
            <p className="text-sm text-gray-600 mt-1 underline underline-offset-2">
              Size {variant?.size}
            </p>
          </div>

          {/* Giá */}
          <div className="text-right flex-shrink-0">
            {comparePrice && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(comparePrice)}
              </p>
            )}
            <p className="text-sm font-medium text-gray-900">
              {formatPrice(price)}
            </p>
          </div>
        </div>

        {/* Actions: xóa, số lượng, yêu thích */}
        <div className="flex items-center gap-3 mt-4">
          {/* Xóa */}
          <button
            onClick={handleRemove}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Số lượng */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-medium w-4 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= (variant?.stock ?? 1)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Yêu thích */}
          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors ml-auto">
            <Heart className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
