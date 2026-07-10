"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import useAuthStore from "@/stores/auth.store";

export default function AvatarUpload() {
  const { user, fetchMe } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.match(/\/(jpg|jpeg|png|webp)$/)) {
      toast.error("Chỉ chấp nhận jpg, jpeg, png, webp");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh tối đa 2MB");
      return;
    }

    setIsUploading(true);
    try {
      await userService.uploadAvatar(file);
      await fetchMe(); // Cập nhật lại user trong store
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-gray-400">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">Click để thay đổi ảnh đại diện</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
