export type TransactionType = "ingreso" | "egreso";

export interface Transaction {
  id: string;
  fecha: string;
  tipo: TransactionType;
  categoria: string;
  descripcion: string;
  monto: number;
  moneda: string;
}

export interface CreditCard {
  id: string;
  nombre: string;
  banco: string;
  lineaCredito: number;
  saldoActual: number;
  tasaAnual: number;
  fechaCorte: number; // día del mes (1-31)
  fechaPago: number;  // día del mes (1-31)
  pagoMinimo: number;
  color: string;
}

export interface PaymentPriority {
  tarjeta: CreditCard;
  montoPagar: number;
  razon: string;
  orden: number;
  ahorroIntereses: number;
}

export interface UnifiedPriorityItem {
  id: string;
  nombre: string;
  institucion: string;
  tipo: "tarjeta" | "credito";
  color: string;
  tasa: number;
  deuda: number;
  pagoRecomendado: number;
  pagoBase: number;
  mesesRestantes: number | null;
  razon: string;
  orden: number;
  ahorroIntereses: number;
}

export interface PersonalCredit {
  id: string;
  nombre: string;
  institucion: string;
  pagosTotales: number;
  tasa: number; // tasa anual en %
  pagosPendientes: number;
  pagoMensual: number;
  color: string;
}

export interface MonthlySummary {
  mes: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

export interface CategorySummary {
  categoria: string;
  monto: number;
  porcentaje: number;
  count: number;
}
