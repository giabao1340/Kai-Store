 "use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brand, Category } from "@/types";

interface ProductFilterProps {
  brands: Brand[];
  categories: Category[];
  totalProducts: number;
}

export default function ProductFilter({
  brands,
  categories,
  totalProducts,
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy giá trị filter hiện tại từ URL
  const currentSearch = searchParams.get("search") ?? "";
  const currentBrand = searchParams.get("brandId") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? "";
  const currentFeatured = searchParams.get("isFeatured") ?? "";

  // Cập nhật URL khi filter thay đổi
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // ← reset về trang 1 khi đổi filter
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const clearAll = () => router.push(pathname);

  const hasFilter =
    currentSearch || currentBrand || currentCategory || currentFeatured;

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        defaultValue={currentSearch}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="w-full"
      />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {/* Nổi bật */}
        <button
          onClick={() =>
            updateFilter("isFeatured", currentFeatured ? "" : "true")
          }
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            currentFeatured
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
          }`}
        >
          Nổi bật
        </button>

        {/* Categories */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              updateFilter(
                "categoryId",
                currentCategory === cat.id ? "" : cat.id,
              )
            }
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              currentCategory === cat.id
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {cat.name}
          </button>
        ))}

        {/* Brands */}
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() =>
              updateFilter("brandId", currentBrand === brand.id ? "" : brand.id)
            }
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              currentBrand === brand.id
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {brand.name}
          </button>
        ))}
      </div>

      {/* Kết quả + Clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{totalProducts} sản phẩm</p>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-black"
          >
            Xóa filter ×
          </Button>
        )}
      </div>
    </div>
  );
}
