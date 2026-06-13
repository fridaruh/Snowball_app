import type { Transaction, CreditCard, PersonalCredit } from "@/types";

function formatMXN(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function buildFinancialContext(
  transactions: Transaction[],
  cards: CreditCard[],
  credits: PersonalCredit[]
): string {
  const sections: string[] = [];

  // --- Transacciones ---
  const ingresos = transactions.filter((t) => t.tipo === "ingreso");
  const egresos = transactions.filter((t) => t.tipo === "egreso");

  if (ingresos.length > 0) {
    const totalIngresos = ingresos.reduce((s, t) => s + t.monto, 0);

    // Agrupar por categoría
    const catMap = new Map<string, number>();
    for (const t of ingresos) {
      catMap.set(t.categoria, (catMap.get(t.categoria) ?? 0) + t.monto);
    }
    const catLines = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, monto]) => `    • ${cat}: ${formatMXN(monto)}`)
      .join("\n");

    // Últimos 5 ingresos
    const recientes = ingresos.slice(0, 5)
      .map((t) => `    • ${t.fecha} | ${t.categoria} | ${t.descripcion} | ${formatMXN(t.monto)}`)
      .join("\n");

    sections.push(
      `## INGRESOS (${ingresos.length} registros)\n` +
      `Total acumulado: ${formatMXN(totalIngresos)}\n` +
      `Por categoría:\n${catLines}\n` +
      `Últimos registros:\n${recientes}`
    );
  }

  if (egresos.length > 0) {
    const totalEgresos = egresos.reduce((s, t) => s + t.monto, 0);

    const catMap = new Map<string, number>();
    for (const t of egresos) {
      catMap.set(t.categoria, (catMap.get(t.categoria) ?? 0) + t.monto);
    }
    const catLines = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, monto]) => `    • ${cat}: ${formatMXN(monto)}`)
      .join("\n");

    const recientes = egresos.slice(0, 5)
      .map((t) => `    • ${t.fecha} | ${t.categoria} | ${t.descripcion} | ${formatMXN(t.monto)}`)
      .join("\n");

    sections.push(
      `## EGRESOS (${egresos.length} registros)\n` +
      `Total acumulado: ${formatMXN(totalEgresos)}\n` +
      `Por categoría:\n${catLines}\n` +
      `Últimos registros:\n${recientes}`
    );
  }

  if (ingresos.length > 0 && egresos.length > 0) {
    const balance = ingresos.reduce((s, t) => s + t.monto, 0) - egresos.reduce((s, t) => s + t.monto, 0);
    sections.push(`## BALANCE NETO\n${formatMXN(balance)}`);
  }

  // --- Tarjetas de crédito ---
  if (cards.length > 0) {
    const cardLines = cards.map((c) => {
      const util = ((c.saldoActual / c.lineaCredito) * 100).toFixed(1);
      return (
        `  • ${c.nombre} (${c.banco})\n` +
        `    Línea de crédito: ${formatMXN(c.lineaCredito)}\n` +
        `    Saldo actual: ${formatMXN(c.saldoActual)} (${util}% de utilización)\n` +
        `    Tasa anual: ${c.tasaAnual}%\n` +
        `    Pago mínimo: ${formatMXN(c.pagoMinimo)}\n` +
        `    Fecha de corte: día ${c.fechaCorte} | Fecha de pago: día ${c.fechaPago}`
      );
    }).join("\n");

    const totalDeudaTarjetas = cards.reduce((s, c) => s + c.saldoActual, 0);
    sections.push(
      `## TARJETAS DE CRÉDITO (${cards.length})\n` +
      `Deuda total en tarjetas: ${formatMXN(totalDeudaTarjetas)}\n` +
      cardLines
    );
  }

  // --- Créditos personales ---
  if (credits.length > 0) {
    const creditLines = credits.map((c) => {
      const pagosRealizados = c.pagosTotales - c.pagosPendientes;
      const deudaRestante = c.pagosPendientes * c.pagoMensual;
      const avance = ((pagosRealizados / c.pagosTotales) * 100).toFixed(1);
      const tasaMensual = c.tasa / 100 / 12;
      const interesProx = (deudaRestante * tasaMensual).toFixed(2);
      return (
        `  • ${c.nombre} (${c.institucion})\n` +
        `    Pagos totales: ${c.pagosTotales} | Realizados: ${pagosRealizados} | Pendientes: ${c.pagosPendientes}\n` +
        `    Avance: ${avance}%\n` +
        `    Pago mensual: ${formatMXN(c.pagoMensual)}\n` +
        `    Deuda restante: ${formatMXN(deudaRestante)}\n` +
        `    Tasa anual: ${c.tasa}% | Interés estimado próximo pago: ${formatMXN(Number(interesProx))}`
      );
    }).join("\n");

    const totalDeudaCreditos = credits.reduce((s, c) => s + c.pagosPendientes * c.pagoMensual, 0);
    const totalMensual = credits
      .filter((c) => c.pagosPendientes > 0)
      .reduce((s, c) => s + c.pagoMensual, 0);

    sections.push(
      `## CRÉDITOS PERSONALES (${credits.length})\n` +
      `Deuda total en créditos: ${formatMXN(totalDeudaCreditos)}\n` +
      `Pago mensual total en créditos: ${formatMXN(totalMensual)}\n` +
      creditLines
    );
  }

  if (sections.length === 0) return "";

  return (
    `Eres un asistente financiero personal que ayuda a Frida a entender y mejorar sus finanzas personales. ` +
    `Responde siempre en español, en texto plano sin ningún formato Markdown (sin asteriscos, sin guiones, sin encabezados, sin negritas). ` +
    `Máximo 100 palabras por respuesta. Sé directo y usa cifras exactas cuando estén disponibles. ` +
    `Sé honesto cuando algo no esté en el contexto.\n\n` +
    `A continuación tienes la información financiera actual de Frida:\n\n` +
    sections.join("\n\n")
  );
}
