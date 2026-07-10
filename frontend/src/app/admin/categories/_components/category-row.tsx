"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Check, X, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { categoryService } from "@/services/category.service";

export interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

interface CategoryRowProps {
  Category: Category;
  isAnotherRowEditing: boolean; // có row khác đang edit không → disable dropdown
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  isEditing: boolean;
}

export default function CategoryRow({
  Category,
  isAnotherRowEditing,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdated,
  onDeleted,
}: CategoryRowProps) {
  const [form, setForm] = useState<CategoryFormState>({
    name: Category.name,
    slug: Category.slug,
    description: Category.description ?? "",
    isActive: Category.isActive,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setForm({
      name: Category.name,
      slug: Category.slug,
      description: Category.description ?? "",
      isActive: Category.isActive,
    });
    onStartEdit();
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Vui lòng nhập tên và slug");
      return;
    }
    setIsSaving(true);
    try {
      await categoryService.update(Category.id, form);
      toast.success("Cập nhật thành công");
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoryService.remove(Category.id);
      toast.success("Đã xóa thương hiệu");
      onDeleted();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Không thể xóa (có thể đang được sản phẩm sử dụng)",
      );
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-gray-50 last:border-0",
        isEditing ? "bg-blue-50/30" : "hover:bg-gray-50",
      )}
    >
      {/* Tên */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <Input
            autoFocus
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="h-8 rounded-lg text-sm"
          />
        ) : (
          <span className="font-medium text-gray-900">{Category.name}</span>
        )}
      </td>

      {/* Slug */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <Input
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="h-8 rounded-lg text-sm font-mono"
          />
        ) : (
          <span className="text-gray-400 font-mono text-xs">{Category.slug}</span>
        )}
      </td>

      {/* Mô tả */}
      <td className="py-2.5 px-4 max-w-xs">
        {isEditing ? (
          <Input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="h-8 rounded-lg text-sm"
          />
        ) : (
          <span className="text-gray-500 line-clamp-1">
            {Category.description || "—"}
          </span>
        )}
      </td>

      {/* Trạng thái */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="rounded"
            />
            Hoạt động
          </label>
        ) : (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              Category.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {Category.isActive ? "Hoạt động" : "Đã ẩn"}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-3 h-7 rounded-full bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              {isSaving ? "..." : "Cập nhật"}
            </button>
            <button
              onClick={onCancelEdit}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={isAnotherRowEditing}>
                <button
                  disabled={isAnotherRowEditing}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  Sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-500"
                >
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </td>
    </tr>
  );
}
