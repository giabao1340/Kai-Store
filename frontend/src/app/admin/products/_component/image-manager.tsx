"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { imageService } from "@/services/product-image.service";

interface ImageManagerProps {
  productId: string;
  images: ProductImage[];
  onChange: () => void;
}

export default function ImageManager({
  productId,
  images,
  onChange,
}: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Validate
    const invalidFile = files.find(
      (f) => !f.type.match(/\/(jpg|jpeg|png|webp)$/),
    );
    if (invalidFile) {
      toast.error("Chỉ chấp nhận jpg, jpeg, png, webp");
      return;
    }
    const oversizedFile = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      toast.error("Mỗi ảnh tối đa 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await imageService.upload(productId, files);
      toast.success(`Upload thành công ${result.images.length} ảnh`);
      onChange();
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await imageService.update(imageId, { isPrimary: true });
      toast.success("Đã đặt làm ảnh chính");
      onChange();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Xóa ảnh này?")) return;
    try {
      await imageService.remove(imageId);
      toast.success("Đã xóa ảnh");
      onChange();
    } catch {
      toast.error("Không thể xóa ảnh");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Hình ảnh ({images.length})
        </h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 rounded-full px-4 py-1.5 hover:border-gray-400 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {isUploading ? "Đang upload..." : "Upload ảnh"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpg,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
          <p className="text-sm text-gray-400">Chưa có ảnh nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 group",
                img.isPrimary ? "border-black" : "border-gray-100",
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? ""}
                fill
                className="object-cover"
                sizes="150px"
              />

              {/* Badge primary */}
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                  Chính
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                    title="Đặt làm ảnh chính"
                  >
                    <Star className="w-4 h-4 text-gray-700" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
