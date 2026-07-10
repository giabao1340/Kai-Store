"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productAdminService } from "@/services/product.service";
import { Product } from "@/types";
import AdminProductRow from "./_component/admin-product-row";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search nhẹ để không gọi API liên tục mỗi ký tự
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, page]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productAdminService.getAll({
        search: debouncedSearch || undefined,
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      setProducts(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white"
          />
        </div>
        <Button asChild className="rounded-full gap-1.5">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Không có sản phẩm nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Sản phẩm
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Danh mục
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Giá
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Kho
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Trạng thái
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                      Nổi bật
                    </th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <AdminProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} trong {total} sản phẩm
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        totalPages <= 7 ||
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 1,
                    )
                    .map((p, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const showEllipsis = prevP && p - prevP > 1;
                      return (
                        <span key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="text-gray-300 text-xs px-1">
                              …
                            </span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                              p === page
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
