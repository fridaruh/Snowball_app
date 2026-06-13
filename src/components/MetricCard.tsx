import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "income" | "expense" | "balance";
  currency?: string;
}

const variantStyles = {
  default: { icon: "text-gray-400 bg-gray-50", amount: "text-gray-900" },
  income: { icon: "text-green-600 bg-green-50", amount: "text-green-700" },
  expense: { icon: "text-red-500 bg-red-50", amount: "text-red-600" },
  balance: { icon: "text-blue-600 bg-blue-50", amount: "text-blue-700" },
};

export function MetricCard({
  title,
  amount,
  icon: Icon,
  trend,
  variant = "default",
  currency = "MXN",
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", styles.amount)}>
              {formatCurrency(amount, currency)}
            </p>
            {trend && (
              <p className={cn("mt-1 text-xs", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value.toFixed(1)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn("rounded-xl p-2.5", styles.icon)}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
