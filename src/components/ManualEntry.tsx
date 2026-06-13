"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onDelete: (id: string) => void;
}

const INCOME_CATEGORIES = ["salario", "freelance", "inversiones", "renta", "ventas", "bono", "otro"];
const EXPENSE_CATEGORIES = [
  "comida", "transporte", "hogar", "ropa", "salud", "entretenimiento",
  "servicios", "educación", "viajes", "deuda", "otro"
];

const emptyForm = {
  fecha: new Date().toISOString().split("T")[0],
  tipo: "ingreso" as "ingreso" | "egreso",
  categoria: "",
  descripcion: "",
  monto: "",
  moneda: "MXN",
};

export function ManualEntry({ transactions, onAdd, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "ingreso" | "egreso">("all");

  const categories = form.tipo === "ingreso" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fecha) errs.fecha = "Requerido";
    if (!form.categoria) errs.categoria = "Requerido";
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) errs.monto = "Monto válido";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onAdd({
      fecha: form.fecha,
      tipo: form.tipo,
      categoria: form.categoria,
      descripcion: form.descripcion.trim(),
      monto: Number(form.monto),
      moneda: form.moneda,
    });
    setForm({ ...emptyForm });
    setErrors({});
    setOpen(false);
  };

  const filtered = transactions.filter((t) => {
    const matchType = filterType === "all" || t.tipo === filterType;
    const matchSearch =
      !search ||
      t.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      t.categoria.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["all", "ingreso", "egreso"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-3 py-2 text-xs font-medium transition-colors",
                filterType === type ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {type === "all" ? "Todos" : type === "ingreso" ? "Ingresos" : "Egresos"}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setForm({ ...emptyForm }); setErrors({}); setOpen(true); }}>
          <Plus size={14} />
          Agregar
        </Button>
      </div>

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length} movimiento{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">No hay movimientos que mostrar</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.slice(0, 50).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 group transition-colors">
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    tx.tipo === "ingreso" ? "bg-green-50" : "bg-red-50"
                  )}>
                    {tx.tipo === "ingreso" ? (
                      <ArrowUpCircle size={14} className="text-green-600" />
                    ) : (
                      <ArrowDownCircle size={14} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.descripcion || tx.categoria}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="capitalize">{tx.categoria}</span> · {formatDate(tx.fecha)}
                    </p>
                  </div>
                  <p className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    tx.tipo === "ingreso" ? "text-green-700" : "text-red-600"
                  )}>
                    {tx.tipo === "ingreso" ? "+" : "-"}{formatCurrency(tx.monto, tx.moneda)}
                  </p>
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {filtered.length > 50 && (
                <p className="pt-2 text-center text-xs text-gray-400">
                  Mostrando 50 de {filtered.length} movimientos
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Agregar movimiento"
      >
        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["ingreso", "egreso"] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setForm((f) => ({ ...f, tipo, categoria: "" }))}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium transition-colors capitalize",
                  form.tipo === tipo
                    ? tipo === "ingreso" ? "bg-green-600 text-white" : "bg-red-500 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                {tipo === "ingreso" ? "Ingreso" : "Egreso"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Fecha"
              type="date"
              value={form.fecha}
              error={errors.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
            />
            <Select
              label="Categoría"
              value={form.categoria}
              error={errors.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              options={[
                { value: "", label: "Seleccionar..." },
                ...categories.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
              ]}
            />
          </div>

          <Input
            label="Descripción (opcional)"
            placeholder="Ej. Salario quincenal enero"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Monto ($)"
              type="number"
              placeholder="0.00"
              value={form.monto}
              error={errors.monto}
              onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
            />
            <Select
              label="Moneda"
              value={form.moneda}
              onChange={(e) => setForm((f) => ({ ...f, moneda: e.target.value }))}
              options={[
                { value: "MXN", label: "MXN" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Agregar movimiento</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
