import Image from "next/image";
import { OrderItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface OrderItemCardProps {
  item: OrderItem;
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
      {/* Ảnh */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
        {item.snapImageUrl ? (
          <Image
            src={item.snapImageUrl}
            alt={item.snapProductName}
            fill
            priority={true}
            loading="eager"
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">
            👟
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">
          {item.snapProductName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{item.snapColor}</p>
        <p className="text-xs text-gray-500 mt-0.5 underline underline-offset-2">
          Size {item.snapSize}
        </p>
        <p className="text-xs text-gray-400 mt-1">x{item.quantity}</p>
      </div>

      {/* Giá */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-900">
          {formatPrice(Number(item.price) * item.quantity)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatPrice(Number(item.price))} / đôi
        </p>
      </div>
    </div>
  );
}
