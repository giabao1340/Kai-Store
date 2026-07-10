"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth.store";
import AdminSidebar from "./_components/admin-sidebar";
import AdminHeader from "./_components/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user?.role !== "ADMIN") router.push("/");
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
