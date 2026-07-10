"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../_component/product-form";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-semibold">Thêm sản phẩm mới</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <ProductForm
          onSuccess={(product) => {
            // Sau khi tạo xong → chuyển sang trang edit để thêm variants/images
            router.push(`/admin/products/${product.id}`);
          }}
        />
      </div>
    </div>
  );
}
