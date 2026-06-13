"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, getMonthlySummary, getCategorySummary, CATEGORY_COLORS } from "@/lib/utils";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
}

export function IncomeAnalysis({ transactions }: Props) {
  const monthly = getMonthlySummary(transactions);
  const categories = getCategorySummary(transactions, "ingreso");
  const totalIngresos = transactions
    .filter((t) => t.tipo === "ingreso")
    .reduce((s, t) => s + t.monto, 0);

  if (transactions.filter((t) => t.tipo === "ingreso").length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TrendingUp size={32} className="mb-3 text-gray-200" />
        <p className="text-sm text-gray-400">No hay ingresos registrados todavía</p>
        <p className="mt-1 text-xs text-gray-300">Importa un CSV o agrega ingresos manualmente</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Monthly area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                contentStyle={{ borderRadius: 10, border: "1px solid #f0f0f0", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                dot={{ r: 3, fill: "#16a34a" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">Sin datos</p>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.slice(0, 6).map((cat, idx) => (
                <div key={cat.categoria} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="flex-1 text-sm text-gray-700 capitalize">{cat.categoria}</span>
                  <span className="text-xs text-gray-400">{cat.porcentaje.toFixed(1)}%</span>
                  <span className="text-sm font-medium text-gray-900 tabular-nums">
                    {formatCurrency(cat.monto)}
                  </span>
                </div>
              ))}
              <div className="mt-3 border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Total ingresos</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(totalIngresos)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
