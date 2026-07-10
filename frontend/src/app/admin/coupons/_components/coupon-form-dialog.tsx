"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { couponService } from "@/services/coupon.service";
import { Coupon, DiscountType } from "@/types";

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null; // null/undefined = tạo mới
  onSuccess: () => void;
}

interface FormState {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function toDateInputValue(date?: string) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10); // yyyy-MM-dd
}

function getEmptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: today,
    endDate: nextMonth.toISOString().slice(0, 10),
    isActive: true,
  };
}

export default function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: CouponFormDialogProps) {
  const [form, setForm] = useState<FormState>(getEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!coupon;

  // Reset form mỗi khi mở dialog
  useEffect(() => {
    if (open) {
      if (coupon) {
        setForm({
          code: coupon.code,
          description: coupon.description ?? "",
          discountType: coupon.discountType,
          discountValue: String(coupon.discountValue),
          minOrderValue: coupon.minOrderValue
            ? String(coupon.minOrderValue)
            : "",
          maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
          startDate: toDateInputValue(coupon.startDate),
          endDate: toDateInputValue(coupon.endDate),
          isActive: coupon.isActive,
        });
      } else {
        setForm(getEmptyForm());
      }
    }
  }, [open, coupon]);

  const update = (key: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    if (!form.code.trim()) return "Vui lòng nhập mã coupon";
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return "Giá trị giảm phải lớn hơn 0";
    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      return "Giảm theo % không được vượt quá 100";
    }
    if (!form.startDate || !form.endDate)
      return "Vui lòng chọn ngày bắt đầu và kết thúc";
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return "Ngày kết thúc phải sau ngày bắt đầu";
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue
          ? Number(form.minOrderValue)
          : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
      };

      if (isEditing) {
        await couponService.update(coupon.id, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await couponService.create(payload);
        toast.success("Tạo mã giảm giá thành công");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mã coupon */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Mã coupon <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="SUMMER20"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              className="rounded-xl font-mono"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <Input
              placeholder="Giảm 20% mùa hè"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Loại giảm giá + Giá trị */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Loại giảm giá
              </label>
              <Select
                value={form.discountType}
                onValueChange={(v) => update("discountType", v as DiscountType)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Theo % (VD: 20%)</SelectItem>
                  <SelectItem value="FIXED">Số tiền cố định</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Giá trị <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "20" : "50000"
                  }
                  value={form.discountValue}
                  onChange={(e) => update("discountValue", e.target.value)}
                  className="rounded-xl pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {form.discountType === "PERCENTAGE" ? "%" : "đ"}
                </span>
              </div>
            </div>
          </div>

          {/* Min order + Max discount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Đơn tối thiểu
              </label>
              <Input
                type="number"
                placeholder="500000"
                value={form.minOrderValue}
                onChange={(e) => update("minOrderValue", e.target.value)}
                className="rounded-xl"
              />
            </div>

            {form.discountType === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Giảm tối đa
                </label>
                <Input
                  type="number"
                  placeholder="200000"
                  value={form.maxDiscount}
                  onChange={(e) => update("maxDiscount", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Số lượt dùng */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Số lượt sử dụng (để trống = không giới hạn)
            </label>
            <Input
              type="number"
              placeholder="100"
              value={form.usageLimit}
              onChange={(e) => update("usageLimit", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Ngày bắt đầu / kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Kích hoạt ngay
              </p>
              <p className="text-xs text-gray-400">Cho phép sử dụng mã này</p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => update("isActive", checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full"
          >
            {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mã"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
