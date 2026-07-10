"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import DeliveryForm from "./_components/delivery-form";
import PaymentMethod from "./_components/payment-method";
import OrderSummary from "./_components/order-summary";
import VietQR from "./_components/viet-qr";
import useCartStore from "@/stores/cart.store";
import useAuthStore from "@/stores/auth.store";
import api from "@/services/api";
import { Order } from "@/types";
import { userService } from "@/services/user.service";

// ── Schema validate ────────────────────────────────
const checkoutSchema = z.object({
  snapFullName: z.string().min(2, "Vui lòng nhập họ tên"),
  snapPhone: z.string().min(10, "Số điện thoại không hợp lệ"),
  snapStreet: z.string().min(5, "Vui lòng nhập địa chỉ"),
  snapProvince: z.string().min(2, "Vui lòng nhập tỉnh/thành"),
  snapDistrict: z.string().min(2, "Vui lòng nhập quận/huyện"),
  snapWard: z.string().min(2, "Vui lòng nhập phường/xã"),
  note: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VIETQR">("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [order, setOrder] = useState<Order | null>(null); // sau khi đặt hàng

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      snapFullName: user?.name ?? "",
      snapPhone: user?.phone ?? "",
      snapStreet: "",
      snapProvince: "",
      snapDistrict: "",
      snapWard: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    // Prefill tên và SĐT từ user info
    if (user) {
      form.setValue("snapFullName", user.name);
      if (user.phone) form.setValue("snapPhone", user.phone);
    }
  }, [user]);

  const handleCouponApply = (code: string, discount: number) => {
    setCouponCode(code);
    setDiscountAmount(discount);
  };

  const [shouldSaveAddress, setShouldSaveAddress] = useState(true);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);
    try {
      // ← Lưu địa chỉ nếu user tick checkbox
      if (shouldSaveAddress) {
        try {
          await userService.createAddress({
            fullName: values.snapFullName,
            phone: values.snapPhone,
            street: values.snapStreet,
            ward: values.snapWard,
            district: values.snapDistrict,
            province: values.snapProvince,
            isDefault: true, // địa chỉ đầu tiên → set default luôn
          });
        } catch {
          // Không block việc đặt hàng nếu lưu địa chỉ thất bại
        }
      }

      // Tạo order
      const newOrder = await api.post<Order>("/orders", {
        ...values,
        paymentMethod: paymentMethod === "VIETQR" ? "VNPAY" : "COD",
        couponCode: couponCode || undefined,
      });

      setOrder(newOrder);

      if (paymentMethod === "COD") {
        toast.success("Đặt hàng thành công!");
        router.push(`/orders/${newOrder.id}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Đặt hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Thanh toán thành công!");
    router.push(`/orders/${order?.id}`);
  };

  if (!cart) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order payment</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Please fill in delivery information and select payment method
        </p>
      </div>

      <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nếu đã đặt hàng và chọn VIETQR → hiện QR */}
            {order && paymentMethod === "VIETQR" ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <VietQR
                  orderId={order.id}
                  amount={Number(order.finalAmount)}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            ) : (
              <>
                {/* Form địa chỉ */}
                <DeliveryForm
                  form={form}
                  onSaveAddressChange={setShouldSaveAddress} // ← thêm prop này
                />

                {/* Phương thức thanh toán */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <PaymentMethod
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                  />
                </div>
              </>
            )}
          </div>

          {/* Cột phải — Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              onCouponApply={handleCouponApply}
              couponCode={couponCode}
              discountAmount={discountAmount}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
