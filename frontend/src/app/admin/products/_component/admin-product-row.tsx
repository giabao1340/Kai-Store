import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface AdminProductRowProps {
  product: Product;
}

export default function AdminProductRow({ product }: AdminProductRowProps) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const totalStock =
    product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const prices = product.variants?.map((v) => Number(v.price)) ?? [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/admin/products/${product.id}`}
          className="flex items-center gap-3"
        >
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm">
                👟
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {product.name}
            </p>
            <p className="text-xs text-gray-400">{product.brand?.name}</p>
          </div>
        </Link>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">
        {product.category?.name}
      </td>
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        {minPrice > 0 ? formatPrice(minPrice) : "—"}
      </td>
      <td className="py-3 px-4 text-sm">
        <span className={totalStock === 0 ? "text-red-500" : "text-gray-600"}>
          {totalStock}
        </span>
      </td>
      <td className="py-3 px-4">
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            product.isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500",
          )}
        >
          {product.isActive ? "Đang bán" : "Đã ẩn"}
        </span>
      </td>
      <td className="py-3 px-4">
        {product.isFeatured && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
            Nổi bật
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <Link
          href={`/admin/products/${product.id}`}
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          Sửa →
        </Link>
      </td>
    </tr>
  );
}
