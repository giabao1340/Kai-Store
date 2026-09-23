"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RevenuePoint } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    revenue: Number(item.revenue),
    displayDate: new Date(item.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <Card className="col-span-2 min-w-0">
      <CardHeader>
        <CardTitle>Doanh thu</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[350px] w-full">
          <AreaChart
            data={chartData}
            responsive
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="displayDate" />

            <YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}M`} />

            <Tooltip formatter={(value) => formatCurrency(Number(value))} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </div>
      </CardContent>
    </Card>
  );
}
