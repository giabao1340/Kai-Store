"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/user.service";
import useAuthStore from "@/stores/auth.store";

const profileSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, fetchMe } = useAuthStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Prefill data từ store
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await userService.updateProfile(values);
      await fetchMe(); // Cập nhật lại store
      toast.success("Cập nhật thông tin thành công");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Họ tên */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Họ tên</label>
        <Input
          {...register("name")}
          placeholder="Nguyễn Văn A"
          className="rounded-xl"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          {...register("email")}
          type="email"
          placeholder="example@email.com"
          className="rounded-xl"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Số điện thoại */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Số điện thoại
        </label>
        <Input
          {...register("phone")}
          placeholder="0901234567"
          className="rounded-xl"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full rounded-full"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
