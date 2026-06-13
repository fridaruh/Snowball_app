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
  { id: "overview", label: "Resumen", icon: BarChart2 },
  { id: "income", label: "Ingresos", icon: TrendingUp },
  { id: "expenses", label: "Egresos", icon: TrendingDown },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "cards", label: "Tarjetas", icon: CreditCard },
  { id: "priority", label: "Prioridad de pago", icon: Target },
  { id: "credits", label: "Créditos", icon: Landmark },
  { id: "transactions", label: "Movimientos", icon: ListPlus },
  { id: "import", label: "Importar CSV", icon: Upload },
  { id: "chat", label: "Chat IA", icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]["id"];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const store = useFinStore();

  if (!store.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
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
    (s, c) => s + c.pagosPendientes * c.pagoMensual, 0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">FinBot</h1>
              <p className="text-xs text-gray-400">Dashboard financiero personal</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>{store.transactions.length} transacciones</span>
            <span>·</span>
            <span>{store.cards.length} tarjetas</span>
            <span>·</span>
            <span>{store.personalCredits.length} créditos</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-4 sm:py-6">
        {/* Nav tabs */}
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 sm:px-3 text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <MetricCard title="Ingresos totales" amount={totalIngresos} icon={TrendingUp} variant="income" />
              <MetricCard title="Egresos totales" amount={totalEgresos} icon={TrendingDown} variant="expense" />
              <MetricCard title="Balance neto" amount={balance} icon={Wallet} variant="balance" />
              <MetricCard title="Deuda en tarjetas" amount={totalDeuda} icon={CreditCard} variant="default" />
              <MetricCard title="Deuda en créditos" amount={totalDeudaCreditos} icon={Landmark} variant="default" />
            </div>

            {store.transactions.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <IncomeAnalysis transactions={store.transactions} />
                <ExpenseAnalysis transactions={store.transactions} />
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-100 py-20 text-center">
                <Upload size={32} className="mb-3 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">No hay datos todavía</p>
                <p className="mt-1 text-xs text-gray-400">
                  Importa un CSV o agrega transacciones manualmente para empezar
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveTab("import")}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700"
                  >
                    Importar CSV
                  </button>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Agregar manual
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "income" && <IncomeAnalysis transactions={store.transactions} />}
        {activeTab === "expenses" && <ExpenseAnalysis transactions={store.transactions} />}
        {activeTab === "calendar" && (
          <PaymentCalendar cards={store.cards} transactions={store.transactions} />
        )}
        {activeTab === "cards" && (
          <CreditCardManager
            cards={store.cards}
            onAdd={store.addCard}
            onUpdate={store.updateCard}
            onDelete={store.deleteCard}
          />
        )}
        {activeTab === "priority" && <PaymentPriority cards={store.cards} credits={store.personalCredits} />}
        {activeTab === "credits" && (
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
        {activeTab === "chat" && (
          <FinChat
            transactions={store.transactions}
            cards={store.cards}
            credits={store.personalCredits}
          />
        )}
        {activeTab === "import" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Importar desde CSV</h2>
              <p className="mt-0.5 text-sm text-gray-400">
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
