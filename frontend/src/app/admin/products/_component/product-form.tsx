"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brand, Category, Product } from "@/types";
import { productAdminService } from "@/services/product.service";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";

const productSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  slug: z
    .string()
    .min(2, "Slug tối thiểu 2 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Vui lòng chọn thương hiệu"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product; // có giá trị → edit mode
  onSuccess: (product: Product) => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(!!product); // nếu edit, slug đã có sẵn

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      brandId: product?.brandId ?? "",
      categoryId: product?.categoryId ?? "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug từ name (chỉ khi chưa edit slug thủ công)
  useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched]);

  useEffect(() => {
    Promise.all([
      brandService.getAll(),
      categoryService.getAll(),
    ]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
    });
  }, []);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const result = product
        ? await productAdminService.update(product.id, values)
        : await productAdminService.create(values);

      toast.success(
        product ? "Cập nhật thành công" : "Tạo sản phẩm thành công",
      );
      onSuccess(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tên sản phẩm */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Tên sản phẩm <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("name")}
          placeholder="Nike Air Force 1"
          className="rounded-xl"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Slug <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("slug")}
          onChange={(e) => {
            setSlugTouched(true);
            setValue("slug", e.target.value);
          }}
          placeholder="nike-air-force-1"
          className="rounded-xl font-mono text-sm"
        />
        {errors.slug && (
          <p className="text-xs text-red-500">{errors.slug.message}</p>
        )}
      </div>

      {/* Brand + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Thương hiệu <span className="text-red-500">*</span>
          </label>
          <select
            {...register("brandId")}
            className="w-full h-9 rounded-xl border border-gray-200 px-3 text-sm bg-white"
          >
            <option value="">Chọn thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.brandId && (
            <p className="text-xs text-red-500">{errors.brandId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            {...register("categoryId")}
            className="w-full h-9 rounded-xl border border-gray-200 px-3 text-sm bg-white"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Mô tả</label>
        <Textarea
          {...register("description")}
          placeholder="Mô tả sản phẩm..."
          className="rounded-xl resize-none"
          rows={4}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded"
              />
              Đang bán
            </label>
          )}
        />
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded"
              />
              Sản phẩm nổi bật
            </label>
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full px-8"
      >
        {isSubmitting ? "Đang lưu..." : product ? "Cập nhật" : "Tạo sản phẩm"}
      </Button>
    </form>
  );
}
