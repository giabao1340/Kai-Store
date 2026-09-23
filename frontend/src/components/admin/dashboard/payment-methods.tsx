import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

import { PaymentMethod } from "@/types/dashboard";


interface Props {
  data: PaymentMethod[];
}

export function PaymentMethods({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phương thức thanh toán</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {data.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;

            return (
              <div key={item.method}>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">{item.method}</span>

                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(item.count)} đơn</span>

                  <span>{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
