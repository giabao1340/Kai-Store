"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BannerForm from "../_components/banner-form";

export default function NewBannerPage() {
  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/banners"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-semibold">Tạo banner mới</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <BannerForm />
      </div>
    </div>
  );
}
