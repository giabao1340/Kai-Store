"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Address } from "@/types";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  province: z.string().min(2, "Vui lòng nhập tỉnh/thành"),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(2, "Vui lòng nhập phường/xã"),
  street: z.string().min(5, "Vui lòng nhập địa chỉ"),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const data = await userService.getAddresses();
    setAddresses(data);
  };

  const openAdd = () => {
    reset({
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (address: Address) => {
    reset({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setIsFormOpen(true);
  };

  const onSubmit = async (values: AddressFormValues) => {
    try {
      if (editingId) {
        await userService.updateAddress(editingId, values);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await userService.createAddress(values as any);
        toast.success("Thêm địa chỉ thành công");
      }
      setIsFormOpen(false);
      fetchAddresses();
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await userService.deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch {
      toast.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userService.setDefaultAddress(id);
      fetchAddresses();
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Địa chỉ giao hàng</h3>
        <Button
          onClick={openAdd}
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm địa chỉ
        </Button>
      </div>

      {/* Danh sách địa chỉ */}
      {addresses.length === 0 && !isFormOpen && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MapPin className="w-8 h-8 text-gray-200" />
          <p className="text-sm text-gray-400">Chưa có địa chỉ nào</p>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              address.isDefault ? "border-black bg-gray-50" : "border-gray-100",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{address.fullName}</p>
                  {address.isDefault && (
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{address.phone}</p>
                <p className="text-xs text-gray-500">
                  {address.street}, {address.ward}, {address.district},{" "}
                  {address.province}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Đặt làm mặc định"
                  >
                    <Check className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => openEdit(address)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm/sửa địa chỉ */}
      {isFormOpen && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h4 className="text-sm font-medium">
            {editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
          </h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  {...register("fullName")}
                  placeholder="Họ tên *"
                  className="rounded-xl text-sm"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  {...register("phone")}
                  placeholder="Số điện thoại *"
                  className="rounded-xl text-sm"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Input
                {...register("street")}
                placeholder="Số nhà, tên đường *"
                className="rounded-xl text-sm"
              />
              {errors.street && (
                <p className="text-xs text-red-500">{errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Input
                  {...register("province")}
                  placeholder="Tỉnh/Thành *"
                  className="rounded-xl text-sm"
                />
                {errors.province && (
                  <p className="text-xs text-red-500">
                    {errors.province.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  {...register("district")}
                  placeholder="Quận/Huyện *"
                  className="rounded-xl text-sm"
                />
                {errors.district && (
                  <p className="text-xs text-red-500">
                    {errors.district.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  {...register("ward")}
                  placeholder="Phường/Xã *"
                  className="rounded-xl text-sm"
                />
                {errors.ward && (
                  <p className="text-xs text-red-500">{errors.ward.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                {...register("isDefault")}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-600">
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setIsFormOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full"
              >
                {isSubmitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
