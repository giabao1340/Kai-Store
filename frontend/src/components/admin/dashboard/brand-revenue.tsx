import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BrandRevenue } from "@/types/dashboard";

import { formatCurrency, formatNumber } from "@/lib/utils";

interface Props {
  data: BrandRevenue[];
}

export function   BrandRevenueChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo thương hiệu</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {data.map((brand, index) => (
            <div key={brand.brandId} className="flex items-center gap-3">
              <span className="w-6 text-sm text-muted-foreground">
                #{index + 1}
              </span>

              <div className="flex-1">
                <p className="font-medium">{brand.brandName}</p>

                <p className="text-xs text-muted-foreground">
                  {formatNumber(brand.soldQuantity)} sản phẩm
                </p>
              </div>

              <span className="font-semibold">
                {formatCurrency(brand.revenue)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
