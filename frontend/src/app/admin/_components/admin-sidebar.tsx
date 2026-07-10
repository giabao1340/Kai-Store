"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Layers,
  Ticket,
  LogOut,
  LayoutGrid,
  Image,
  MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/auth.store";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/brands", label: "Thương hiệu", icon: Tag },
  { href: "/admin/categories", label: "Danh mục", icon: Layers },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/reviews", label: "Đánh giá", icon: MessagesSquare },
  { href: "/admin/banners", label: "Banners", icon: Image },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-56 min-w-56 h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <p className="text-base font-semibold">KAI STORE</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
