"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, getMonthlySummary, getCategorySummary, CATEGORY_COLORS } from "@/lib/utils";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
}

export function ExpenseAnalysis({ transactions }: Props) {
  const monthly = getMonthlySummary(transactions);
  const categories = getCategorySummary(transactions, "egreso");
  const totalEgresos = transactions
    .filter((t) => t.tipo === "egreso")
    .reduce((s, t) => s + t.monto, 0);

  if (transactions.filter((t) => t.tipo === "egreso").length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TrendingDown size={32} className="mb-3 text-gray-200" />
        <p className="text-sm text-gray-400">No hay egresos registrados todavía</p>
        <p className="mt-1 text-xs text-gray-300">Importa un CSV o agrega egresos manualmente</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Monthly bars */}
      <Card>
        <CardHeader>
          <CardTitle>Egresos mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Egresos"]}
                contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }}
              />
              <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="monto"
                  nameKey="categoria"
                >
                  {categories.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), ""]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.slice(0, 6).map((cat, idx) => (
                <div key={cat.categoria} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 capitalize">{cat.categoria}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 tabular-nums">
                      {formatCurrency(cat.monto)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.porcentaje}%`,
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-3 border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Total egresos</span>
                <span className="text-sm font-bold text-red-600">{formatCurrency(totalEgresos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
