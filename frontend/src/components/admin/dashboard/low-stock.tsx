import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LowStockProduct } from "@/types/dashboard";
import { ChevronRight } from "lucide-react";

interface Props {
  data: LowStockProduct[];
}

export function LowStock({ data }: Props) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚠️ Sắp hết hàng</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tồn kho ổn định.</p>
          ) : (
            data.map((item) => (
              <div
                key={item.variantId}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-b pb-3 last:border-0"
              >
                {/* Cột 1 */}
                <div className="min-w-0">
                  <p className="font-medium">{item.productName}</p>

                  <p className="text-xs text-muted-foreground">{item.sku}</p>

                  <p className="text-xs text-muted-foreground">
                    Size {item.size} · {item.color}
                  </p>
                </div>

                {/* Cột 2 */}
                <span className="font-semibold">{item.quantity}</span>

                {/* Cột 3 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(
                      `/admin/products/${item.productId}?variant=${item.variantId}`,
                    )
                  }
                >
                  <span className="sr-only">Xem chi tiết</span>
                  <ChevronRight />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
