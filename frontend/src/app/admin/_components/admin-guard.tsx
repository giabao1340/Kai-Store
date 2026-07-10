"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth.store";

export default function AdminGuard({
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
    if (user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  return <>{children}</>;
}
