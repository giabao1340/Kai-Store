"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { OrderStatus } from "@/types/dashboard";

interface Props {
  data: OrderStatus[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  SHIPPING: "#8B5CF6",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
  REFUNDED: "#6B7280",
};

export function OrderStatusChart({ data }: Props) {
  // Map lại data để có label tiếng Việt + màu riêng từng status
  const chartData = data.map((item) => ({
    ...item,
    label: STATUS_LABEL[item.status] ?? item.status,
    color: STATUS_COLOR[item.status] ?? "#9CA3AF",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái đơn hàng</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[350px] w-full">
          {/* ❌ Xóa responsive + style — ResponsiveContainer đã lo việc này */}
          <PieChart
            responsive
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                // ✅ Thêm fill để mỗi slice có màu riêng
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
}
