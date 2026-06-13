"use client";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  Calendar, CreditCard, Target, Upload, ListPlus, Landmark, MessageSquare,
} from "lucide-react";
import { useFinStore } from "@/store/useFinStore";
import { MetricCard } from "@/components/MetricCard";
import { IncomeAnalysis } from "@/components/IncomeAnalysis";
import { ExpenseAnalysis } from "@/components/ExpenseAnalysis";
import { PaymentCalendar } from "@/components/PaymentCalendar";
import { CreditCardManager } from "@/components/CreditCardManager";
import { PaymentPriority } from "@/components/PaymentPriority";
import { ManualEntry } from "@/components/ManualEntry";
import { CSVUploader } from "@/components/CSVUploader";
import { PersonalCreditManager } from "@/components/PersonalCreditManager";
import { FinChat } from "@/components/FinChat";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview",      label: "Resumen",          icon: BarChart2 },
  { id: "income",        label: "Ingresos",          icon: TrendingUp },
  { id: "expenses",      label: "Egresos",           icon: TrendingDown },
  { id: "calendar",      label: "Calendario",        icon: Calendar },
  { id: "cards",         label: "Tarjetas",          icon: CreditCard },
  { id: "priority",      label: "Prioridad de pago", icon: Target },
  { id: "credits",       label: "Créditos",          icon: Landmark },
  { id: "transactions",  label: "Movimientos",       icon: ListPlus },
  { id: "import",        label: "Importar CSV",      icon: Upload },
  { id: "chat",          label: "Chat IA",           icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]["id"];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const store = useFinStore();

  if (!store.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div
          className="h-7 w-7 rounded-full border-[3px] border-[var(--gray-300)] border-t-[var(--color-primary)] animate-spin"
          role="status"
          aria-label="Cargando"
        />
      </div>
    );
  }

  const totalIngresos = store.transactions
    .filter((t) => t.tipo === "ingreso")
    .reduce((s, t) => s + t.monto, 0);
  const totalEgresos = store.transactions
    .filter((t) => t.tipo === "egreso")
    .reduce((s, t) => s + t.monto, 0);
  const balance = totalIngresos - totalEgresos;
  const totalDeuda = store.cards.reduce((s, c) => s + c.saldoActual, 0);
  const totalDeudaCreditos = store.personalCredits.reduce(
    (s, c) => s + c.pagosPendientes * c.pagoMensual,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--gray-300)] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: "var(--color-primary)" }}
            >
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              >
                Snowball
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--gray-600)" }}>
                Dashboard financiero personal
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "var(--gray-600)" }}>
            <span>{store.transactions.length} transacciones</span>
            <span aria-hidden>·</span>
            <span>{store.cards.length} tarjetas</span>
            <span aria-hidden>·</span>
            <span>{store.personalCredits.length} créditos</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Nav tabs ──────────────────────────────────────────────── */}
        <nav
          className="mb-8 flex gap-1 overflow-x-auto rounded-[var(--radius-md)] p-1"
          style={{ background: "var(--gray-100)" }}
          aria-label="Secciones"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-medium transition-all min-h-[44px]",
                  isActive
                    ? "bg-white shadow-sm text-[var(--color-ink)]"
                    : "text-[var(--gray-600)] hover:text-[var(--color-ink)]"
                )}
                style={isActive ? { color: "var(--color-ink)" } : undefined}
              >
                <Icon size={14} aria-hidden />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Overview ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <MetricCard title="Ingresos totales"  amount={totalIngresos}      icon={TrendingUp}  variant="income" />
              <MetricCard title="Egresos totales"   amount={totalEgresos}       icon={TrendingDown} variant="expense" />
              <MetricCard title="Balance neto"      amount={balance}            icon={Wallet}       variant="balance" />
              <MetricCard title="Deuda en tarjetas" amount={totalDeuda}         icon={CreditCard}   variant="default" />
              <MetricCard title="Deuda en créditos" amount={totalDeudaCreditos} icon={Landmark}     variant="default" />
            </div>

            {store.transactions.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <IncomeAnalysis transactions={store.transactions} />
                <ExpenseAnalysis transactions={store.transactions} />
              </div>
            ) : (
              <div
                className="flex flex-col items-center rounded-2xl border-2 border-dashed py-24 text-center"
                style={{ borderColor: "var(--gray-300)" }}
              >
                <Upload size={36} className="mb-4" style={{ color: "var(--gray-300)" }} />
                <p className="text-base font-semibold" style={{ color: "var(--gray-900)", fontFamily: "var(--font-display)" }}>
                  No hay datos todavía
                </p>
                <p className="mt-2 text-sm max-w-xs" style={{ color: "var(--gray-600)" }}>
                  Importa un CSV o agrega transacciones manualmente para empezar.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setActiveTab("import")}
                    className="rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium min-h-[48px] transition-all hover:brightness-90"
                    style={{ background: "var(--color-primary)", color: "var(--color-ink)" }}
                  >
                    Importar CSV
                  </button>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="rounded-[var(--radius-pill)] border px-6 py-3 text-sm font-medium min-h-[48px] transition-all hover:bg-[var(--gray-100)]"
                    style={{ borderColor: "var(--color-ink)", color: "var(--color-ink)" }}
                  >
                    Agregar manual
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "income"       && <IncomeAnalysis transactions={store.transactions} />}
        {activeTab === "expenses"     && <ExpenseAnalysis transactions={store.transactions} />}
        {activeTab === "calendar"     && (
          <PaymentCalendar cards={store.cards} transactions={store.transactions} />
        )}
        {activeTab === "cards"        && (
          <CreditCardManager
            cards={store.cards}
            onAdd={store.addCard}
            onUpdate={store.updateCard}
            onDelete={store.deleteCard}
          />
        )}
        {activeTab === "priority"     && <PaymentPriority cards={store.cards} credits={store.personalCredits} />}
        {activeTab === "credits"      && (
          <PersonalCreditManager
            credits={store.personalCredits}
            onAdd={store.addPersonalCredit}
            onUpdate={store.updatePersonalCredit}
            onDelete={store.deletePersonalCredit}
          />
        )}
        {activeTab === "transactions" && (
          <ManualEntry
            transactions={store.transactions}
            onAdd={store.addTransaction}
            onDelete={store.deleteTransaction}
          />
        )}
        {activeTab === "chat"         && (
          <FinChat
            transactions={store.transactions}
            cards={store.cards}
            credits={store.personalCredits}
          />
        )}
        {activeTab === "import"       && (
          <div className="space-y-6">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--gray-900)" }}
              >
                Importar desde CSV
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--gray-600)" }}>
                Sube tu archivo CSV con el historial de transacciones. Las transacciones duplicadas se omiten automáticamente.
              </p>
            </div>
            <CSVUploader onImport={store.addTransactions} />
          </div>
        )}
      </div>
    </div>
  );
}
