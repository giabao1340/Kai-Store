import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import { RecentOrder } from "@/types/dashboard";


interface Props {
  data: RecentOrder[];
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  return labels[status] ?? status;
}

function getPaymentLabel(status: string) {
  const labels: Record<string, string> = {
    PAID: "Đã thanh toán",
    UNPAID: "Chưa thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
  };

  return labels[status] ?? status;
}

export function RecentOrders({ data }: Props) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3">Mã đơn</th>

                <th className="pb-3">Khách hàng</th>

                <th className="pb-3">Tổng tiền</th>

                <th className="pb-3">Đơn hàng</th>

                <th className="pb-3">Thanh toán</th>

                <th className="pb-3">Ngày</th>
              </tr>
            </thead>

            <tbody>
              {data.map((order) => (
                <tr key={order.orderId} className="border-b last:border-0">
                  <td className="py-4 font-medium">
                    #{order.orderId.slice(-8)}
                  </td>

                  <td className="py-4">{order.customerName}</td>

                  <td className="py-4 font-medium">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  <td className="py-4">{getStatusLabel(order.status)}</td>

                  <td className="py-4">
                    {getPaymentLabel(order.paymentStatus)}
                  </td>

                  <td className="py-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
