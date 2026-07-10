"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import useAuthStore from "@/stores/auth.store";
import { getErrorMessage } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register(values.email, values.password, values.name);
      toast.success("Đăng ký thành công!");
      router.push("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Họ tên</FieldLabel>
            <Input
              {...field}
              placeholder="Nguyễn Văn A"
              disabled={isLoading}
              aria-invalid={!!fieldState.error}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Email</FieldLabel>
            <Input
              {...field}
              type="email"
              placeholder="example@email.com"
              disabled={isLoading}
              aria-invalid={!!fieldState.error}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Mật khẩu</FieldLabel>
            <Input
              {...field}
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!fieldState.error}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      {/* Confirm Password */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel>Xác nhận mật khẩu</FieldLabel>
            <Input
              {...field}
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!fieldState.error}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>
    </form>
  );
}
