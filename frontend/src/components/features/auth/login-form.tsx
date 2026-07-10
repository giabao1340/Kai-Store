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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
