"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CreditCard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrderStatusTimeline from "./_components/order-status";
import useAuthStore from "@/stores/auth.store";
import { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderItemCard from "./_components/order-item-card";
import { orderService } from "@/services/order.service";
import { is } from "zod/v4/locales";
import { MessageSquare } from "lucide-react";
import ReviewForm from "@/components/features/review/review-form";
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review.type";


const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VietQR / Chuyển khoản",
  MOMO: "Ví MoMo",
  STRIPE: "Thẻ tín dụng",
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
    UNPAID: { label: "Chưa thanh toán", color: "text-yellow-600 bg-yellow-50" },
    PAID: { label: "Đã thanh toán", color: "text-green-600 bg-green-50" },
    FAILED: { label: "Thất bại", color: "text-red-600 bg-red-50" },
    REFUNDED: { label: "Đã hoàn tiền", color: "text-gray-600 bg-gray-50" },
  };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<{
    productId: string;
    productName: string;
  } | null>(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);



  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    fetchOrder();
  }, [isAuthenticated, id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOne(id);
      setOrder(data);
    } catch {
      toast.error("Không tìm thấy đơn hàng");
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setIsCancelling(true);
    try {
      await orderService.cancel(id);
      toast.success("Hủy đơn hàng thành công");
      fetchOrder(); // refetch để cập nhật status
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!order) return null;

  const paymentStatus = order.payment
    ? PAYMENT_STATUS_CONFIG[order.payment.status]
    : null;

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">
              #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Nút hủy */}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            className="rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {isCancelling ? "Đang hủy..." : "Hủy đơn"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline trạng thái */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">
              Trạng thái đơn hàng
            </h2>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* Danh sách sản phẩm */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Sản phẩm ({order.items.length})
            </h2>
            {order.items.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">
                Địa chỉ giao hàng
              </h2>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.snapFullName}</p>
              <p>{order.snapPhone}</p>
              <p>
                {order.snapStreet}, {order.snapWard},{order.snapDistrict},{" "}
                {order.snapProvince}
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-5">
          {/* Thanh toán */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">
                Thanh toán
              </h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Phương thức</span>
                <span className="text-gray-900 text-right text-xs">
                  {PAYMENT_METHOD_LABEL[order.payment?.method ?? "COD"]}
                </span>
              </div>
              {paymentStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatus.color}`}
                  >
                    {paymentStatus.label}
                  </span>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Chi tiết giá */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(Number(order.totalAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span className="text-blue-600">
                {formatPrice(Number(order.finalAmount))}
              </span>
            </div>
          </div>

          {/* Note nếu có */}
          {order.note && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Ghi chú</p>
              <p className="text-sm text-gray-700">{order.note}</p>
            </div>
          )}

          {/* Tiếp tục mua sắm */}
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/products">Tiếp tục mua sắm</Link>
          </Button>
          {order.status === "DELIVERED" && (
            <div className="mt-4 space-y-3">
              {/* Nút viết đánh giá cho từng sản phẩm */}
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-t border-gray-50"
                >
                  <p className="text-xs text-gray-500 line-clamp-1 flex-1 mr-3">
                    {item.snapProductName}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setReviewingItem({
                        productId: item.variantId, // dùng variantId để tìm productId
                        productName: item.snapProductName,
                      })
                    }
                    className="rounded-full text-xs flex-shrink-0 gap-1.5"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Đánh giá
                  </Button>
                </div>
              ))}

              {/* Form đánh giá */}
              {reviewingItem && (
                <div className="border border-gray-100 rounded-xl p-4 mt-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Đánh giá sản phẩm
                  </h3>
                  <ReviewForm
                    productId={reviewingItem.productId}
                    productName={reviewingItem.productName}
                    orderId={order.id}
                    onSuccess={() => {
                      setReviewingItem(null);
                      setReviewRefresh((n) => n + 1);
                    }}
                    onCancel={() => setReviewingItem(null)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
