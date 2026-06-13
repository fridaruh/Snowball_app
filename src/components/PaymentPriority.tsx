"use client";
import { useState } from "react";
import { Target, ChevronDown, ChevronUp, Info, CreditCard, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency, calcularPrioridadUnificada, cn } from "@/lib/utils";
import type { CreditCard as CreditCardType, PersonalCredit } from "@/types";

interface Props {
  cards: CreditCardType[];
  credits: PersonalCredit[];
}

export function PaymentPriority({ cards, credits }: Props) {
  const [ingreso, setIngreso] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const ingresoNum = parseFloat(ingreso) || 0;
  const prioridades = calcularPrioridadUnificada(cards, credits, ingresoNum);

  const totalDeuda = prioridades.reduce((s, p) => s + p.deuda, 0);
  const totalBase = prioridades.reduce((s, p) => s + p.pagoBase, 0);
  const excedente = Math.max(0, ingresoNum - totalBase);

  const tieneItems = cards.some((c) => c.saldoActual > 0) || credits.some((c) => c.pagosPendientes > 0);

  if (!tieneItems) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Target size={32} className="mb-3 text-gray-200" />
        <p className="text-sm text-gray-400">Sin deudas activas</p>
        <p className="mt-1 text-xs text-gray-300">
          Agrega tarjetas de crédito o créditos personales para ver el orden de pago óptimo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Deuda total", value: totalDeuda, color: "text-red-600" },
          { label: "Pagos base", value: totalBase, color: "text-orange-500" },
          { label: "Ingreso disponible", value: ingresoNum, color: "text-blue-600" },
          { label: "Excedente", value: excedente, color: "text-green-600" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className={cn("text-lg font-bold tabular-nums mt-0.5", item.color)}>
                {formatCurrency(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leyenda de tipos */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <CreditCard size={12} />
          Tarjeta de crédito
        </span>
        <span className="flex items-center gap-1.5">
          <Landmark size={12} />
          Crédito personal
        </span>
      </div>

      {/* Income input */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1">
              <Input
                label="¿Cuánto dinero tienes disponible para pagar deudas este mes?"
                type="number"
                placeholder="Ej. 8000"
                value={ingreso}
                onChange={(e) => setIngreso(e.target.value)}
              />
            </div>
            {ingresoNum > 0 && ingresoNum < totalBase && (
              <div className="mb-1 flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                <Info size={12} />
                Insuficiente para cubrir pagos base ({formatCurrency(totalBase)})
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Method explanation */}
      <Card>
        <CardContent className="pt-5">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-1.5">
                <Target size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Método Avalancha (óptimo matemáticamente)</p>
                <p className="text-xs text-gray-400">Paga primero la tasa más alta — ahorra más en intereses</p>
              </div>
            </div>
            {showInfo ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>
          {showInfo && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4 text-xs text-gray-600 leading-relaxed">
              El método avalancha ordena todas las deudas (tarjetas y créditos) por tasa de interés de mayor
              a menor. Cubres el pago mínimo o cuota fija de cada una y destinas el dinero sobrante a la
              deuda con mayor tasa. Para créditos personales el pago mensual es fijo, por lo que el
              excedente solo se aplica a tarjetas con deuda revolvente.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority list */}
      <div className="space-y-3">
        {prioridades.map((p) => (
          <Card
            key={p.id}
            className={cn(p.orden === 1 && "ring-2 ring-offset-1 ring-gray-900")}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {/* Order badge */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    p.orden === 1 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {p.orden}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <p className="font-semibold text-gray-900">{p.nombre}</p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {p.institucion}
                        </span>
                        <span className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                          p.tipo === "tarjeta"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        )}>
                          {p.tipo === "tarjeta"
                            ? <CreditCard size={10} />
                            : <Landmark size={10} />}
                          {p.tipo === "tarjeta" ? "Tarjeta" : "Crédito"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{p.razon}</p>
                    </div>
                    <div className="sm:shrink-0 sm:text-right">
                      <p className="text-lg font-bold tabular-nums text-gray-900">
                        {formatCurrency(p.pagoRecomendado)}
                      </p>
                      <p className="text-xs text-gray-400">a pagar</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Deuda restante: {formatCurrency(p.deuda)}</span>
                      {p.mesesRestantes != null && (
                        <span>
                          ~{p.mesesRestantes} {p.mesesRestantes !== 1 ? "meses" : "mes"} para liquidar
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all"
                        style={{
                          width: `${Math.min((p.pagoRecomendado / p.deuda) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {prioridades.length > 0 && ingresoNum > 0 && (
        <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-700">Resumen del plan:</strong> Con {formatCurrency(ingresoNum)} disponibles,
          cubre los pagos base ({formatCurrency(totalBase)}) y destina el excedente de{" "}
          {formatCurrency(excedente)} a <strong>{prioridades[0]?.nombre}</strong> primero
          {prioridades[0]?.tipo === "credito" ? " (pago fijo, sin excedente aplicable)" : ""}.
        </div>
      )}
    </div>
  );
}
