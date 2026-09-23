"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Brand, Category } from "@/types";

interface ProductFilterProps {
  brands: Brand[];
  categories: Category[];
  totalProducts: number;
}

const PRICE_RANGES = [
  {
    label: "Dưới 1 triệu",
    min: "",
    max: "1000000",
  },
  {
    label: "1 - 2 triệu",
    min: "1000000",
    max: "2000000",
  },
  {
    label: "2 - 3 triệu",
    min: "2000000",
    max: "3000000",
  },
  {
    label: "3 - 5 triệu",
    min: "3000000",
    max: "5000000",
  },
  {
    label: "Trên 5 triệu",
    min: "5000000",
    max: "",
  },
];

export default function ProductFilter({
  brands,
  categories,
  totalProducts,
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // =========================
  // Current URL filters
  // =========================

  const currentSearch = searchParams.get("search") ?? "";
  const currentBrand = searchParams.get("brandId") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? "";
  const currentFeatured = searchParams.get("isFeatured") ?? "";

  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  // =========================
  // Local price state
  // =========================

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Đồng bộ state nếu URL thay đổi từ bên ngoài
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // =========================
  // Update normal filter
  // =========================

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Filter thay đổi → quay về page 1
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // =========================
  // Update price filter
  // =========================

  const updatePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPriceInput) {
      params.set("minPrice", minPriceInput);
    } else {
      params.delete("minPrice");
    }

    if (maxPriceInput) {
      params.set("maxPrice", maxPriceInput);
    } else {
      params.delete("maxPrice");
    }

    // Filter thay đổi → page 1
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  // =========================
  // Select price preset
  // =========================

  const selectPriceRange = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
  };

  // =========================
  // Clear
  // =========================

  const clearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");

    router.push(pathname);
  };

  const hasFilter =
    currentSearch ||
    currentBrand ||
    currentCategory ||
    currentFeatured ||
    currentMinPrice ||
    currentMaxPrice;

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          defaultValue={currentSearch}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full"
        />
      </div>

      {/* Featured */}
      <div className="flex flex-wrap gap-2">
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

      {/* ========================= */}
      {/* PRICE FILTER */}
      {/* ========================= */}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Khoảng giá</p>

          {(minPriceInput || maxPriceInput) && (
            <button
              type="button"
              onClick={() => {
                setMinPriceInput("");
                setMaxPriceInput("");
              }}
              className="text-xs text-gray-500 hover:text-black"
            >
              Xóa giá
            </button>
          )}
        </div>

        {/* Preset price */}
        <div className="grid grid-cols-2 gap-2">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              minPriceInput === range.min && maxPriceInput === range.max;

            return (
              <button
                key={range.label}
                type="button"
                onClick={() => selectPriceRange(range.min, range.max)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                <span className="mr-2">{isSelected ? "●" : "○"}</span>

                {range.label}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={updatePriceFilter}
          className="w-full"
          disabled={
            minPriceInput === currentMinPrice &&
            maxPriceInput === currentMaxPrice
          }
        >
          Áp dụng khoảng giá
        </Button>
      </div>

      {/* Result + Clear */}
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
