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
  default:  { icon: "text-[var(--gray-600)] bg-[var(--gray-100)]", amount: "text-[var(--gray-900)]" },
  income:   { icon: "text-[var(--success)] bg-[#E8F8EF]",          amount: "text-[var(--success)]" },
  expense:  { icon: "text-[var(--error)] bg-[#FCE8E8]",            amount: "text-[var(--error)]" },
  balance:  { icon: "text-[var(--info)] bg-[#E6EFFD]",             amount: "text-[var(--info)]" },
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
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-600)]">
              {title}
            </p>
            <p className={cn("mt-2 text-xl sm:text-2xl font-bold tabular-nums font-[var(--font-display)]", styles.amount)}>
              {formatCurrency(amount, currency)}
            </p>
            {trend && (
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  trend.value >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value.toFixed(1)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn("rounded-[var(--radius-md)] p-3", styles.icon)}>
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
