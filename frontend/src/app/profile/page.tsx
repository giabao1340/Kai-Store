"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AvatarUpload from "./_components/avatar-upload";
import ProfileForm from "./_components/profile-form";
import AddressSection from "./_components/address-section";
import useAuthStore from "@/stores/auth.store";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Tài khoản của tôi</h1>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
          <AvatarUpload />
          <p className="mt-3 font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Thông tin cá nhân</h2>
          <ProfileForm />
        </div>

        {/* Địa chỉ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <AddressSection />
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <Link
            href="/orders"
            className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Đơn hàng của tôi</span>
            </div>
            <span className="text-gray-300">›</span>
          </Link>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full rounded-full border-red-200 text-red-500 hover:bg-red-50 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
