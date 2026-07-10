"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productAdminService } from "@/services/product.service";
import { Product } from "@/types";
import ProductForm from "../_component/product-form";
import VariantManager from "../_component/variant-manager";
import ImageManager from "../_component/image-manager";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await productAdminService.getOne(id);
      setProduct(data);
    } catch {
      toast.error("Không tìm thấy sản phẩm");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteProduct = async () => {
  //   if (!confirm("Xóa sản phẩm này? Hành động không thể hoàn tác.")) return;
  //   try {
  //     await productAdminService.remove(id);
  //     toast.success("Đã xóa sản phẩm");
  //     router.push("/admin/products");
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message ?? "Không thể xóa sản phẩm");
  //   }
  // };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-semibold">{product.name}</h1>
        </div>

        {/* <Button
          onClick={handleDeleteProduct}
          variant="outline"
          size="sm"
          className="rounded-full border-red-200 text-red-500 hover:bg-red-50 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa sản phẩm
        </Button> */}
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Thông tin sản phẩm</h2>
        <ProductForm
          product={product}
          onSuccess={(updated) => setProduct(updated)}
        />
      </div>

      {/* Variants */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <VariantManager
          productId={product.id}
          variants={product.variants ?? []}
          onChange={fetchProduct}
        />
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <ImageManager
          productId={product.id}
          images={product.images ?? []}
          onChange={fetchProduct}
        />
      </div>
    </div>
  );
}
