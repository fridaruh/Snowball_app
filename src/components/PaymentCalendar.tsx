"use client";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Scissors, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, getUpcomingPayments } from "@/lib/utils";
import type { CreditCard as CreditCardType, Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  cards: CreditCardType[];
  transactions: Transaction[];
}

export function PaymentCalendar({ cards, transactions }: Props) {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = getDaysInMonth(current);
  const firstDay = getDay(startOfMonth(current)); // 0 = Sunday

  const upcoming = getUpcomingPayments(cards);

  // Build event map for current month
  type CalEvent = { type: "corte" | "pago" | "ingreso"; label: string; color: string; monto: number };
  const eventMap = new Map<number, CalEvent[]>();

  const addEvent = (day: number, event: CalEvent) => {
    if (!eventMap.has(day)) eventMap.set(day, []);
    eventMap.get(day)!.push(event);
  };

  for (const card of cards) {
    addEvent(card.fechaCorte, {
      type: "corte",
      label: card.nombre,
      color: card.color,
      monto: card.saldoActual,
    });
    addEvent(card.fechaPago, {
      type: "pago",
      label: card.nombre,
      color: card.color,
      monto: card.pagoMinimo,
    });
  }

  // Income from transactions in current month
  for (const tx of transactions) {
    if (tx.tipo !== "ingreso") continue;
    const d = new Date(tx.fecha + "T00:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      addEvent(d.getDate(), {
        type: "ingreso",
        label: tx.descripcion || tx.categoria,
        color: "#16a34a",
        monto: tx.monto,
      });
    }
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendario de pagos</CardTitle>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-sm font-semibold text-gray-700 capitalize min-w-[120px] text-center">
                {format(current, "MMMM yyyy", { locale: es })}
              </span>
              <button onClick={next} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((b) => <div key={`blank-${b}`} />)}
            {days.map((day) => {
              const events = eventMap.get(day) ?? [];
              const today = isToday(new Date(year, month, day));
              return (
                <div
                  key={day}
                  className={cn(
                    "relative min-h-[56px] rounded-lg p-1 text-xs transition-colors",
                    today ? "bg-gray-900" : events.length > 0 ? "bg-gray-50" : "hover:bg-gray-50"
                  )}
                >
                  <span className={cn("font-medium", today ? "text-white" : "text-gray-700")}>{day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {events.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-0.5 rounded px-0.5"
                        title={`${ev.label}: ${formatCurrency(ev.monto)}`}
                      >
                        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <span className="truncate text-[10px] text-gray-600">{ev.label}</span>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{events.length - 2} más</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-1.5">
              <Scissors size={11} className="text-gray-400" />
              <span className="text-xs text-gray-500">Fecha de corte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard size={11} className="text-gray-400" />
              <span className="text-xs text-gray-500">Fecha de pago</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">Ingreso</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming events list */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Calendar size={24} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Agrega tarjetas de crédito para ver tus fechas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 8).map((ev, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-3 bg-gray-50">
                  <div
                    className="h-8 w-1 rounded-full shrink-0"
                    style={{ backgroundColor: ev.tarjeta.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.tarjeta.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {ev.tipo === "corte" ? "Fecha de corte" : "Fecha de pago"} ·{" "}
                      {format(ev.fecha, "d MMM", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-semibold tabular-nums", ev.tipo === "corte" ? "text-orange-600" : "text-red-600")}>
                      {formatCurrency(ev.monto)}
                    </p>
                    <p className="text-xs text-gray-400">{ev.tipo === "pago" ? "pago mínimo" : "saldo"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
