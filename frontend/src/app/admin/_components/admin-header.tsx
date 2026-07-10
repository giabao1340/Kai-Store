"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Sản phẩm",
  "/admin/products/new": "Tạo Sản Phẩm",
  "/admin/orders": "Đơn hàng",
  "/admin/brands": "Thương hiệu",
  "/admin/categories": "Danh mục",
  "/admin/coupons": "Mã giảm giá",
  "/admin/banners": "Banner",
  "/admin/banners/new": "Tạo Banner",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-2 flex-shrink-0">
      <Link
        href="/admin/dashboard"
        className="text-sm text-gray-400 hover:text-gray-600"
      >
        Admin
      </Link>
      {pathname !== "/admin/dashboard" && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </>
      )}
    </header>
  );
}
