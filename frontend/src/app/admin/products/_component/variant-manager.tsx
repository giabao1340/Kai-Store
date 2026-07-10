"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { variantService } from "@/services/product-variant.service";

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
  onChange: () => void;
}

interface VariantFormData {
  size: string;
  color: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
}

const EMPTY_FORM: VariantFormData = {
  size: "",
  color: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: "",
};

export default function VariantManager({
  productId,
  variants,
  onChange,
}: VariantManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (variant: ProductVariant) => {
    setForm({
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: String(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? String(variant.compareAtPrice)
        : "",
      stock: String(variant.stock),
    });
    setEditingId(variant.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.size || !form.color || !form.sku || !form.price || !form.stock) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId,
        size: form.size,
        color: form.color,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
      };

      if (editingId) {
        await variantService.update(editingId, payload);
        toast.success("Cập nhật variant thành công");
      } else {
        await variantService.create(payload);
        toast.success("Thêm variant thành công");
      }
      setIsFormOpen(false);
      onChange();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa variant này?")) return;
    try {
      await variantService.remove(id);
      toast.success("Đã xóa variant");
      onChange();
    } catch {
      toast.error("Không thể xóa variant");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Variants ({variants.length})
        </h3>
        <Button
          onClick={openAdd}
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm variant
        </Button>
      </div>

      {/* Table variants */}
      {variants.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">
                  Size
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">
                  Màu
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">
                  SKU
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">
                  Giá
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-400">
                  Kho
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-3 py-2.5">{v.size}</td>
                  <td className="px-3 py-2.5">{v.color}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-500">
                    {v.sku}
                  </td>
                  <td className="px-3 py-2.5">
                    {formatPrice(Number(v.price))}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={v.stock === 0 ? "text-red-500" : ""}>
                      {v.stock}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(v)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form thêm/sửa variant */}
      {isFormOpen && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <h4 className="text-sm font-medium">
            {editingId ? "Sửa variant" : "Thêm variant mới"}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Size (39, 40...) *"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="rounded-xl text-sm"
              />
              <Input
                placeholder="Màu sắc *"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="rounded-xl text-sm"
              />
            </div>

            <Input
              placeholder="SKU (mã duy nhất) *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="rounded-xl text-sm font-mono"
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                placeholder="Giá bán *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-xl text-sm"
              />
              <Input
                type="number"
                placeholder="Giá gốc"
                value={form.compareAtPrice}
                onChange={(e) =>
                  setForm({ ...form, compareAtPrice: e.target.value })
                }
                className="rounded-xl text-sm"
              />
              <Input
                type="number"
                placeholder="Tồn kho *"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="rounded-xl text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full w-full"
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingId
                  ? "Cập nhật"
                  : "Thêm variant"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
