import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

import { TopProduct } from "@/types/dashboard";

interface Props {
  data: TopProduct[];
}

export function TopProducts({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-5">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
          ) : (
            data.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{product.productName}</p>

                  <p className="text-sm text-muted-foreground">
                    Đã bán: {formatNumber(product.soldQuantity)}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
