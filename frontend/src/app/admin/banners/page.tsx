"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bannerService } from "@/services/banner.service";
import { Banner } from "@/types/banner.type";
import BannerRow, { BannerFormState } from "./_components/banner-row";
import Link from "next/link";

const EMPTY_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonLink: "",
  buttonText: "",
  collection: "",
  isActive: false,
  order: 0,
  description: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminbannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<BannerFormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await bannerService.getAll();
      setBanners(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNameChange = (value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      title: value,
      subtitle: slugTouched ? prev.subtitle : slugify(value),
    }));
  };

  const handleSubmitCreate = async () => {
    if (!createForm.imageUrl.trim()) {
      toast.error("Vui lòng thêm ảnh");
      return;
    }
    setIsSaving(true);
    try {
      await bannerService.create(createForm);
      toast.success("Thêm thương hiệu thành công");
      setIsCreating(false);
      fetchBanners();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Thương hiệu</h1>
        {!isCreating && (
          <Button asChild className="rounded-full gap-1.5">
            <Link href="/admin/banners/new">
              <Plus className="w-4 h-4" />
              Thêm banner
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-16">
                  Image
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                  Tiêu để
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                  Subtitle
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                  Mô tả nút
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-28">
                  Link sản phẩm
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-28">
                  Bộ sưu tập
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-28">
                  Mô tả
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-28">
                  Thứ tự hiển thị
                </th>
                <th className="text-left text-xs font-medium text-gray-400 py-3 px-4 w-28">
                  Trạng thái
                </th>
                <th className="py-3 px-4 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {/* Dòng tạo mới */}
              {isCreating && (
                <tr className="border-b border-gray-50 bg-blue-50/30">
                  <td className="py-2.5 px-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                      —
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <Input
                      autoFocus
                      placeholder="Tên thương hiệu"
                      value={createForm.title}
                      onChange={(e) => handleCreateNameChange(e.target.value)}
                      className="h-8 rounded-lg text-sm"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <Input
                      placeholder="slug"
                      value={createForm.subtitle}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setCreateForm((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }));
                      }}
                      className="h-8 rounded-lg text-sm font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <Input
                      placeholder="Mô tả (tùy chọn)"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="h-8 rounded-lg text-sm"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={createForm.isActive}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      Hoạt động
                    </label>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={handleSubmitCreate}
                        disabled={isSaving}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-green-50 text-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsCreating(false)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Danh sách banners */}
              {banners.map((banner) => (
                <BannerRow
                  key={banner.id}
                  banner={banner}
                  isEditing={editingId === banner.id}
                  isAnotherRowEditing={
                    editingId !== null && editingId !== banner.id
                  }
                  onStartEdit={() => {
                    setEditingId(banner.id);
                    setIsCreating(false);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdated={() => {
                    setEditingId(null);
                    fetchBanners();
                  }}
                  onDeleted={fetchBanners}
                />
              ))}

              {banners.length === 0 && !isCreating && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    Chưa có thương hiệu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
