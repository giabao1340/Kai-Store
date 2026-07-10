"use client";
import Link from "next/link";
import {
  ClipboardList,
  Menu,
  Search,
  ShoppingCart,
  User,
  LogOutIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import useAuthStore from "@/stores/auth.store";
import useCartStore from "@/stores/cart.store";
import { useRouter, useSearchParams } from "next/navigation";
import { set } from "zod";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Trang chủ", href: "/" },
  { name: "Sản phẩm", href: "/products" },
  { name: "Thương hiệu", href: "/products?brand=mlb" },
  { name: "Khuyến mãi", href: "/products" },
];

export default function MenuBar() {
  const { cart, fetchCart, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  let cartCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  const router = useRouter();
  const { logout } = useAuthStore();
  const handleLogOut = () => {
    clearCart();
    logout();
    router.push("/auth");
  };
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      router.push("/products");
      return;
    }
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(e as any);
  };
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight transition hover:opacity-80"
        >
          Kai Store
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          {categories.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated && user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* User */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Field orientation="horizontal">
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="submit">
                <Search className="w-4 h-4" />
              </Button>
            </Field>
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#">
                  <User className="size-6" />
                </Link>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon />
                    <span>Tài khoản</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ClipboardList />
                    <span>Đơn hàng</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogOut}>
                  <LogOutIcon />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="size-5" />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              <div className="mt-8 flex flex-col gap-6">
                {/* Search Mobile */}
                {/* Categories */}
                <nav className="flex flex-col gap-4">
                  {categories.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="border-t pt-4">
                  <Link
                    href="/auth"
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <User className="size-5" />
                    Tài khoản
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
