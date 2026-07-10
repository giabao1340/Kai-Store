"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bannerService } from "@/services/banner.service";
import { Banner } from "@/types/banner.type";

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

interface BannerFormProps {
  banner?: Banner; // có → edit mode, không có → create mode
  onSuccess?: (banner: Banner) => void;
}

const EMPTY_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  collection: "",
  isActive: true,
  order: 0,
  description: "",
};

export default function BannerForm({ banner, onSuccess }: BannerFormProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!banner;

  const [form, setForm] = useState<BannerFormState>(
    banner
      ? {
          title: banner.title ?? "",
          subtitle: banner.subtitle ?? "",
          imageUrl: banner.imageUrl,
          buttonText: banner.buttonText ?? "",
          buttonLink: banner.buttonLink ?? "",
          collection: banner.collection ?? "",
          isActive: banner.isActive,
          order: banner.order,
          description: banner.description ?? "",
        }
      : EMPTY_FORM,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempBannerId, setTempBannerId] = useState<string | null>(null);

  const update = (key: keyof BannerFormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Upload ảnh ────────────────────────────────────
  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      let targetId = banner?.id ?? tempBannerId;

      // Nếu create mode và chưa có banner tạm → tạo banner tạm trước
      if (!targetId) {
        const temp = await bannerService.create({
          ...form,
          imageUrl: "temp",
          isActive: false,
        });
        setTempBannerId(temp.id);
        targetId = temp.id;
      }

      const result = await bannerService.uploadImage(targetId, file);
      update("imageUrl", result.imageUrl);
      toast.success("Upload ảnh thành công");
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.imageUrl.trim()) {
      toast.error("Vui lòng upload ảnh banner");
      return;
    }

    setIsSubmitting(true);
    try {
      let result: Banner;

      if (isEditing) {
        // Edit mode → update trực tiếp
        result = await bannerService.update(banner.id, form);
        toast.success("Cập nhật banner thành công");
      } else if (tempBannerId) {
        // Create mode đã có banner tạm → update lại với form đầy đủ
        result = await bannerService.update(tempBannerId, {
          ...form,
          isActive: form.isActive,
        });
        toast.success("Tạo banner thành công");
      } else {
        // Create mode chưa upload ảnh → tạo mới hoàn toàn
        result = await bannerService.create(form);
        toast.success("Tạo banner thành công");
      }

      onSuccess?.(result);
      if (!isEditing) router.push("/admin/banners");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload ảnh */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Ảnh banner <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => !isUploading && imageInputRef.current?.click()}
          className="relative rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
        >
          {form.imageUrl ? (
            <div className="relative h-48">
              <img
                src={form.imageUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Đổi ảnh
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <p className="text-sm">Click để upload ảnh banner</p>
                  <p className="text-xs">JPG, PNG, WebP — tối đa 5MB</p>
                </>
              )}
            </div>
          )}

          {isUploading && form.imageUrl && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUploadImage(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Tiêu đề + Subtitle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
          <Input
            placeholder="Bộ sưu tập mới 2026"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Subtitle</label>
          <Input
            placeholder="Nike Air Max 270"
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Mô tả</label>
        <Textarea
          placeholder="Êm ái. Phong cách. Đỉnh cao."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
        />
      </div>

      {/* Button text + link */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Text nút</label>
          <Input
            placeholder="Mua ngay"
            value={form.buttonText}
            onChange={(e) => update("buttonText", e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Link nút</label>
          <Input
            placeholder="/products?isFeatured=true"
            value={form.buttonLink}
            onChange={(e) => update("buttonLink", e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Collection + Order */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Bộ sưu tập
          </label>
          <Input
            placeholder="summer-2026"
            value={form.collection}
            onChange={(e) => update("collection", e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Thứ tự hiển thị
          </label>
          <Input
            type="number"
            placeholder="0"
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value))}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Trạng thái */}
      <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Kích hoạt</p>
          <p className="text-xs text-gray-400">
            Hiển thị banner trên trang chủ
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => update("isActive", !form.isActive)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              form.isActive ? "bg-black" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                form.isActive ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/banners")}
          className="rounded-full flex-1"
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="rounded-full flex-1"
        >
          {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo banner"}
        </Button>
      </div>
    </div>
  );
}
