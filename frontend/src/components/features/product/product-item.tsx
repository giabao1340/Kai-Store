import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductItemProps {
  product: Product;
}

export default function ProductItem({ product }: ProductItemProps) {
  // Lấy ảnh primary, fallback về ảnh đầu tiên
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];

  // Lấy giá thấp nhất từ variants
  const prices = product.variants?.map((v) => Number(v.price)) ?? [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Lấy compareAtPrice nếu có
  const comparePrices =
    product.variants?.map((v) => Number(v.compareAtPrice)).filter(Boolean) ??
    [];
  const maxComparePrice =
    comparePrices.length > 0 ? Math.max(...comparePrices) : null;

  // Check còn hàng không
  const totalStock =
    product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  // Tính % giảm giá
  const discountPercent =
    maxComparePrice && minPrice
      ? Math.round((1 - minPrice / maxComparePrice) * 100)
      : null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden transition-shadow hover:shadow-md">
        {/* Ảnh sản phẩm */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              loading="eager"
              priority={true}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            // Placeholder khi chưa có ảnh
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl text-gray-200">👟</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-black text-white text-xs px-2 py-0.5">
                Hot
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-gray-400 text-white text-xs px-2 py-0.5">
                Hết hàng
              </Badge>
            )}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-3 space-y-1">
          {/* Brand */}
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {product.brand?.name}
          </p>

          {/* Tên sản phẩm */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-black">
            {product.name}
          </h3>

          {/* Giá */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(minPrice)}
            </span>
            {maxComparePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(maxComparePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
