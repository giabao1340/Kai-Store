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
import { bannerService } from "@/services/banner.service";
import { Banner } from "@/types/banner.type";
import { cn } from "@/lib/utils";

export interface BannerFormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  collection: string;
  isActive: boolean;
  order: number;
  description: string;
}

interface BannerRowProps {
  banner: Banner;
  isEditing: boolean;
  isAnotherRowEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function BannerRow({
  banner,
  isEditing,
  isAnotherRowEditing,
  onStartEdit,
  onCancelEdit,
  onUpdated,
  onDeleted,
}: BannerRowProps) {
  const [form, setForm] = useState<BannerFormState>({
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    imageUrl: banner.imageUrl,
    buttonLink: banner.buttonLink ?? "",
    buttonText: banner.buttonText ?? "",
    collection: banner.collection ?? "",
    isActive: banner.isActive,
    order: banner.order,
    description: banner.description ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setForm({
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      buttonLink: banner.buttonLink ?? "",
      buttonText: banner.buttonText ?? "",
      collection: banner.collection ?? "",
      isActive: banner.isActive,
      order: banner.order,
      description: banner.description ?? "",
    });
    onStartEdit();
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await bannerService.update(banner.id, form);
      toast.success("Cập nhật banner thành công");
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await bannerService.remove(banner.id);
      toast.success("Đã xóa banner");
      onDeleted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Không thể xóa banner");
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await bannerService.uploadImage(banner.id, file);
      setForm((prev) => ({ ...prev, imageUrl: result.imageUrl }));
      toast.success("Đã cập nhật ảnh banner");
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-gray-50 last:border-0",
        isEditing ? "bg-blue-50/30" : "hover:bg-gray-50",
      )}
    >
      {/* Ảnh */}
      <td className="py-2.5 px-4">
        <div className="relative group">
          <div className="relative w-16 h-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-300">
                —
              </div>
            )}
          </div>

          {isEditing && (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
            </button>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*" // ← đổi thành này
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file);
              e.target.value = "";
            }}
          />

          {isUploading && (
            <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
        </div>
      </td>
      {/* Tiêu đề */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <Input
            autoFocus
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="h-8 rounded-lg text-sm"
          />
        ) : (
          <span className="font-medium text-gray-900">
            {banner.title || "—"}
          </span>
        )}
      </td>

      {/* Subtitle */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <Input
            value={form.subtitle}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            className="h-8 rounded-lg text-sm"
          />
        ) : (
          <span className="text-gray-500 text-xs line-clamp-1">
            {banner.subtitle || "—"}
          </span>
        )}
      </td>

      {/* Button */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={form.buttonText}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, buttonText: e.target.value }))
              }
              placeholder="Text"
              className="h-8 rounded-lg text-sm w-24"
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            {banner.buttonText || "—"}
          </span>
        )}
      </td>
      {/* Link sản phẩm */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={form.buttonLink}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, buttonLink: e.target.value }))
              }
              placeholder="/products"
              className="h-8 rounded-lg text-sm"
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            {banner.buttonLink || "—"}
          </span>
        )}
      </td>
      {/* Collection */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={form.collection}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, collection: e.target.value }))
              }
              placeholder="Text"
              className="h-8 rounded-lg text-sm w-24"
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            {banner.collection || "—"}
          </span>
        )}
      </td>
      {/* Description */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Text"
              className="h-8 rounded-lg text-sm w-24"
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            {banner.description || "—"}
          </span>
        )}
      </td>
      {/* Thứ tự hiển thị */}
      <td className="py-2.5 px-4">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
              }
              placeholder="Text"
              className="h-8 rounded-lg text-sm w-24"
            />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            {banner.order || "—"}
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
            Hiện
          </label>
        ) : (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              banner.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {banner.isActive ? "Hiện" : "Ẩn"}
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
