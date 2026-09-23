import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  growth?: number;
  icon: React.ReactNode;
}

export function StatCard({ title, value, growth, icon }: StatCardProps) {
  const isPositive = (growth ?? 0) >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>

            <h3 className="mt-2 text-2xl font-bold">{value}</h3>

            {growth !== undefined && (
              <div
                className={`mt-2 flex items-center gap-1 text-sm ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {Math.abs(growth).toFixed(1)}%
                <span className="text-muted-foreground">so với kỳ trước</span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
