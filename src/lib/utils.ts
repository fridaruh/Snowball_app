import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Transaction, CreditCard, PersonalCredit, PaymentPriority, UnifiedPriorityItem, MonthlySummary, CategorySummary } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function getMonthlySummary(transactions: Transaction[]): MonthlySummary[] {
  const map = new Map<string, { ingresos: number; egresos: number }>();

  for (const t of transactions) {
    const key = t.fecha.slice(0, 7); // YYYY-MM
    const current = map.get(key) ?? { ingresos: 0, egresos: 0 };
    if (t.tipo === "ingreso") current.ingresos += t.monto;
    else current.egresos += t.monto;
    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, { ingresos, egresos }]) => ({
      mes: format(parseISO(`${mes}-01`), "MMM yyyy", { locale: es }),
      ingresos,
      egresos,
      balance: ingresos - egresos,
    }));
}

export function getCategorySummary(
  transactions: Transaction[],
  tipo: "ingreso" | "egreso"
): CategorySummary[] {
  const filtered = transactions.filter((t) => t.tipo === tipo);
  const total = filtered.reduce((s, t) => s + t.monto, 0);
  const map = new Map<string, { monto: number; count: number }>();

  for (const t of filtered) {
    const current = map.get(t.categoria) ?? { monto: 0, count: 0 };
    current.monto += t.monto;
    current.count += 1;
    map.set(t.categoria, current);
  }

  return Array.from(map.entries())
    .map(([categoria, { monto, count }]) => ({
      categoria,
      monto,
      count,
      porcentaje: total > 0 ? (monto / total) * 100 : 0,
    }))
    .sort((a, b) => b.monto - a.monto);
}

export function calcularPrioridad(
  tarjetas: CreditCard[],
  ingresoDisponible: number
): PaymentPriority[] {
  const conDeuda = tarjetas.filter((t) => t.saldoActual > 0);
  if (conDeuda.length === 0) return [];

  const totalMinimos = conDeuda.reduce((s, t) => s + t.pagoMinimo, 0);
  const excedente = Math.max(0, ingresoDisponible - totalMinimos);

  // Ordenar por tasa de interés descendente (método avalancha)
  const ordenadas = [...conDeuda].sort((a, b) => b.tasaAnual - a.tasaAnual);

  return ordenadas.map((tarjeta, idx) => {
    let montoPagar = tarjeta.pagoMinimo;
    let razon = `Pago mínimo (${tarjeta.tasaAnual}% anual)`;

    if (idx === 0 && excedente > 0) {
      const extra = Math.min(excedente, tarjeta.saldoActual - tarjeta.pagoMinimo);
      montoPagar += extra;
      razon = `Pagar primero — tasa más alta (${tarjeta.tasaAnual}% anual). Aplica excedente de ${formatCurrency(extra)}.`;
    } else if (idx === 0) {
      razon = `Tasa más alta (${tarjeta.tasaAnual}% anual) — paga el mínimo o más si puedes.`;
    }

    const ahorroMensual =
      ((tarjeta.tasaAnual / 100) / 12) * (montoPagar - tarjeta.pagoMinimo);

    return {
      tarjeta,
      montoPagar,
      razon,
      orden: idx + 1,
      ahorroIntereses: ahorroMensual,
    };
  });
}

export function getUpcomingPayments(tarjetas: CreditCard[]): Array<{
  tarjeta: CreditCard;
  fecha: Date;
  tipo: "corte" | "pago";
  monto: number;
}> {
  const hoy = new Date();
  const eventos = [];

  for (const tarjeta of tarjetas) {
    for (let i = 0; i < 2; i++) {
      const mesCorte = new Date(hoy.getFullYear(), hoy.getMonth() + i, tarjeta.fechaCorte);
      const mesPago = new Date(hoy.getFullYear(), hoy.getMonth() + i, tarjeta.fechaPago);

      if (mesCorte >= hoy) {
        eventos.push({ tarjeta, fecha: mesCorte, tipo: "corte" as const, monto: tarjeta.saldoActual });
      }
      if (mesPago >= hoy) {
        eventos.push({ tarjeta, fecha: mesPago, tipo: "pago" as const, monto: tarjeta.pagoMinimo });
      }
    }
  }

  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}

export function calcularPrioridadUnificada(
  tarjetas: CreditCard[],
  creditos: PersonalCredit[],
  ingresoDisponible: number
): UnifiedPriorityItem[] {
  // Normalizar tarjetas (solo las que tienen saldo)
  const itemsTarjeta: UnifiedPriorityItem[] = tarjetas
    .filter((c) => c.saldoActual > 0)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      institucion: c.banco,
      tipo: "tarjeta" as const,
      color: c.color,
      tasa: c.tasaAnual,
      deuda: c.saldoActual,
      pagoRecomendado: c.pagoMinimo,
      pagoBase: c.pagoMinimo,
      mesesRestantes: null,
      razon: "",
      orden: 0,
      ahorroIntereses: 0,
    }));

  // Normalizar créditos personales (solo los que tienen pagos pendientes)
  const itemsCredito: UnifiedPriorityItem[] = creditos
    .filter((c) => c.pagosPendientes > 0)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      institucion: c.institucion,
      tipo: "credito" as const,
      color: c.color,
      tasa: c.tasa,
      deuda: c.pagosPendientes * c.pagoMensual,
      pagoRecomendado: c.pagoMensual,
      pagoBase: c.pagoMensual,
      mesesRestantes: c.pagosPendientes,
      razon: "",
      orden: 0,
      ahorroIntereses: 0,
    }));

  const todos = [...itemsTarjeta, ...itemsCredito];
  if (todos.length === 0) return [];

  // Ordenar por tasa descendente (método avalancha)
  todos.sort((a, b) => b.tasa - a.tasa);

  const totalBase = todos.reduce((s, i) => s + i.pagoBase, 0);
  const excedente = Math.max(0, ingresoDisponible - totalBase);

  return todos.map((item, idx) => {
    let pagoRecomendado = item.pagoBase;
    let razon = "";
    let ahorroIntereses = 0;

    if (idx === 0) {
      if (item.tipo === "tarjeta" && excedente > 0) {
        const extra = Math.min(excedente, item.deuda - item.pagoBase);
        pagoRecomendado += extra;
        ahorroIntereses = ((item.tasa / 100) / 12) * extra;
        razon = `Pagar primero — tasa más alta (${item.tasa}% anual). Aplica excedente de ${formatCurrency(extra)}.`;
      } else {
        razon = `Tasa más alta (${item.tasa}% anual) — prioriza este pago${item.tipo === "credito" ? "; el monto es fijo" : " o paga más del mínimo si puedes"}.`;
      }
    } else {
      razon = item.tipo === "tarjeta"
        ? `Pago mínimo (${item.tasa}% anual)`
        : `Cuota fija (${item.tasa}% anual) — ${item.mesesRestantes} pago${(item.mesesRestantes ?? 0) !== 1 ? "s" : ""} restante${(item.mesesRestantes ?? 0) !== 1 ? "s" : ""}`;
    }

    const mesesRestantes = item.tipo === "tarjeta"
      ? (pagoRecomendado > 0 ? Math.ceil(item.deuda / pagoRecomendado) : null)
      : item.mesesRestantes;

    return { ...item, pagoRecomendado, razon, orden: idx + 1, ahorroIntereses, mesesRestantes };
  });
}

export const CARD_COLORS = [
  "#2563EB", "#7C3AED", "#DB2777", "#D97706", "#059669",
  "#0891B2", "#DC2626", "#65A30D", "#9333EA", "#C2410C",
];

export const CATEGORY_COLORS = [
  "#2563EB", "#7C3AED", "#DB2777", "#D97706", "#059669",
  "#0891B2", "#DC2626", "#65A30D", "#9333EA", "#C2410C",
  "#0D9488", "#B45309", "#4F46E5", "#BE185D", "#15803D",
];
