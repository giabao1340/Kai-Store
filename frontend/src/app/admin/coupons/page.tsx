"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CouponFormDialog from "./_components/coupon-form-dialog";
import { couponService } from "@/services/coupon.service";
import { Coupon } from "@/types";
import CouponRow from "./_components/coupon-row";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mã giảm giá này?")) return;
    try {
      await couponService.remove(id);
      toast.success("Đã xóa mã giảm giá");
      fetchCoupons();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Không thể xóa mã giảm giá",
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mã giảm giá</h1>
        <Button onClick={openCreate} className="rounded-full gap-1.5">
          <Plus className="w-4 h-4" />
          Tạo mã giảm giá
        </Button>
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
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Chưa có mã giảm giá nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Mã
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Giảm giá
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Đơn tối thiểu
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Đã dùng
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Thời hạn
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 py-3 px-4">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <CouponRow
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={() => openEdit(coupon)}
                    onDelete={() => handleDelete(coupon.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CouponFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={editingCoupon}
        onSuccess={fetchCoupons}
      />
    </div>
  );
}
