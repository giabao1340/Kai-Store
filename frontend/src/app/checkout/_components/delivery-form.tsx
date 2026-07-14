"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutFormValues } from "../page";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Address } from "@/types";
import { cn } from "@/lib/utils";

interface DeliveryFormProps {
  form: UseFormReturn<CheckoutFormValues>;
  onSaveAddressChange: (save: boolean) => void; // ← callback lên checkout/page
}

export default function DeliveryForm({
  form,
  onSaveAddressChange,
}: DeliveryFormProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // mặc định tick sẵn

  useEffect(() => {
    fetchAddresses();
  }, []);


  const applyAddress = (address: Address) => {
    setSelectedId(address.id);
    setValue("snapFullName", address.fullName);
    setValue("snapPhone", address.phone);
    setValue("snapStreet", address.street);
    setValue("snapWard", address.ward);
    setValue("snapDistrict", address.district);
    setValue("snapProvince", address.province);
  };

  // Khi chọn địa chỉ có sẵn → báo lên checkout KHÔNG lưu
  const handleSelectAddress = (address: Address) => {
    applyAddress(address);
    setShowManual(false);
    onSaveAddressChange(false); // ← không lưu địa chỉ mới
  };

  // Khi bấm "Dùng địa chỉ khác" → mới cho phép lưu
  const handleUseManual = () => {
    setSelectedId(null);
    setShowManual(true);
    setSaveAddress(true);
    onSaveAddressChange(true); // ← mặc định tick lưu
    setValue("snapFullName", "");
    setValue("snapPhone", "");
    setValue("snapStreet", "");
    setValue("snapWard", "");
    setValue("snapDistrict", "");
    setValue("snapProvince", "");
  };

  // Khi fetch xong có địa chỉ → tắt lưu ngay
  const fetchAddresses = async () => {
    try {
      const data = await userService.getAddresses();
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        applyAddress(defaultAddress);
        onSaveAddressChange(false); // ← đã có địa chỉ, không lưu mới
      } else {
        setShowManual(true);
        onSaveAddressChange(true); // ← chưa có, mặc định lưu
      }
    } catch {
      setShowManual(true);
      onSaveAddressChange(true);
    }
  };


  const handleSaveAddressChange = (checked: boolean) => {
    setSaveAddress(checked);
    onSaveAddressChange(checked); // báo lên checkout/page
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h2 className="text-lg font-semibold">Delivery information</h2>

      {/* Danh sách địa chỉ đã lưu */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Chọn địa chỉ giao hàng:</p>
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={cn(
                "rounded-xl border p-4 cursor-pointer transition-all",
                selectedId === address.id && !showManual
                  ? "border-black bg-gray-50"
                  : "border-gray-100 hover:border-gray-300",
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
                {selectedId === address.id && !showManual && (
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleUseManual}
            className={cn(
              "w-full rounded-xl border-2 border-dashed p-3 text-sm transition-colors flex items-center justify-center gap-2",
              showManual
                ? "border-black text-black"
                : "border-gray-200 text-gray-400 hover:border-gray-300",
            )}
          >
            <Plus className="w-4 h-4" />
            Dùng địa chỉ khác
          </button>
        </div>
      )}

      {/* Form nhập tay */}
      {showManual && (
        <div className="space-y-4 pt-1">
          {addresses.length > 0 && (
            <p className="text-xs text-gray-400">
              Nhập địa chỉ giao hàng mới bên dưới:
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Full name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("snapFullName")}
              placeholder="Nguyễn Văn A"
              className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
            />
            {errors.snapFullName && (
              <p className="text-xs text-red-500">
                {errors.snapFullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("snapPhone")}
              placeholder="0901234567"
              className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
            />
            {errors.snapPhone && (
              <p className="text-xs text-red-500">{errors.snapPhone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("snapStreet")}
              placeholder="Số nhà, tên đường"
              className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
            />
            {errors.snapStreet && (
              <p className="text-xs text-red-500">
                {errors.snapStreet.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                City/Province <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("snapProvince")}
                placeholder="TP. HCM"
                className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
              />
              {errors.snapProvince && (
                <p className="text-xs text-red-500">
                  {errors.snapProvince.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("snapDistrict")}
                placeholder="Quận 1"
                className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
              />
              {errors.snapDistrict && (
                <p className="text-xs text-red-500">
                  {errors.snapDistrict.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Ward <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("snapWard")}
                placeholder="Phường Bến Nghé"
                className="rounded-xl bg-blue-50 border-0 focus-visible:ring-1"
              />
              {errors.snapWard && (
                <p className="text-xs text-red-500">
                  {errors.snapWard.message}
                </p>
              )}
            </div>
          </div>

          {/* ← Checkbox lưu địa chỉ */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="saveAddress"
              checked={saveAddress}
              onChange={(e) => handleSaveAddressChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="saveAddress" className="text-sm text-gray-600">
              Lưu địa chỉ này để dùng lần sau
            </label>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Note (optional)
        </label>
        <Textarea
          {...register("note")}
          placeholder="Note for delivery"
          className="rounded-xl bg-gray-50 border-0 focus-visible:ring-1 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}
