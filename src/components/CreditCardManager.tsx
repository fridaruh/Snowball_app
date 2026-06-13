"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, cn } from "@/lib/utils";
import type { CreditCard as CreditCardType } from "@/types";

interface Props {
  cards: CreditCardType[];
  onAdd: (card: Omit<CreditCardType, "id" | "color">) => void;
  onUpdate: (id: string, updates: Partial<CreditCardType>) => void;
  onDelete: (id: string) => void;
}

const emptyForm = {
  nombre: "",
  banco: "",
  lineaCredito: "",
  saldoActual: "",
  tasaAnual: "",
  fechaCorte: "",
  fechaPago: "",
  pagoMinimo: "",
};

type FormData = typeof emptyForm;

function validate(f: FormData) {
  const errors: Partial<FormData> = {};
  if (!f.nombre.trim()) errors.nombre = "Requerido";
  if (!f.banco.trim()) errors.banco = "Requerido";
  if (!f.lineaCredito || isNaN(Number(f.lineaCredito))) errors.lineaCredito = "Número válido";
  if (!f.saldoActual || isNaN(Number(f.saldoActual))) errors.saldoActual = "Número válido";
  if (!f.tasaAnual || isNaN(Number(f.tasaAnual))) errors.tasaAnual = "Número válido";
  if (!f.fechaCorte || isNaN(Number(f.fechaCorte)) || Number(f.fechaCorte) < 1 || Number(f.fechaCorte) > 31)
    errors.fechaCorte = "Día 1-31";
  if (!f.fechaPago || isNaN(Number(f.fechaPago)) || Number(f.fechaPago) < 1 || Number(f.fechaPago) > 31)
    errors.fechaPago = "Día 1-31";
  if (!f.pagoMinimo || isNaN(Number(f.pagoMinimo))) errors.pagoMinimo = "Número válido";
  return errors;
}

export function CreditCardManager({ cards, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCardType | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (card: CreditCardType) => {
    setEditing(card);
    setForm({
      nombre: card.nombre,
      banco: card.banco,
      lineaCredito: String(card.lineaCredito),
      saldoActual: String(card.saldoActual),
      tasaAnual: String(card.tasaAnual),
      fechaCorte: String(card.fechaCorte),
      fechaPago: String(card.fechaPago),
      pagoMinimo: String(card.pagoMinimo),
    });
    setErrors({});
    setOpen(true);
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      nombre: form.nombre.trim(),
      banco: form.banco.trim(),
      lineaCredito: Number(form.lineaCredito),
      saldoActual: Number(form.saldoActual),
      tasaAnual: Number(form.tasaAnual),
      fechaCorte: Number(form.fechaCorte),
      fechaPago: Number(form.fechaPago),
      pagoMinimo: Number(form.pagoMinimo),
    };

    if (editing) onUpdate(editing.id, data);
    else onAdd(data);
    setOpen(false);
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    error: errors[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {cards.length === 0 ? "Agrega tus tarjetas de crédito" : `${cards.length} tarjeta${cards.length !== 1 ? "s" : ""} registrada${cards.length !== 1 ? "s" : ""}`}
        </p>
        <Button onClick={openNew} size="sm">
          <Plus size={14} />
          Nueva tarjeta
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <CreditCard size={32} className="mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">No hay tarjetas registradas</p>
          <p className="mt-1 text-xs text-gray-300">Agrega tus tarjetas para ver el análisis de deuda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const utilization = (card.saldoActual / card.lineaCredito) * 100;
            const utilizationColor =
              utilization > 80 ? "bg-red-500" : utilization > 50 ? "bg-orange-400" : "bg-green-500";

            return (
              <Card key={card.id} className="overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: card.color }} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{card.nombre}</p>
                      <p className="text-xs text-gray-400">{card.banco}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(card)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setConfirmDelete(card.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Utilización</span>
                        <span className={cn("font-medium", utilization > 80 ? "text-red-600" : utilization > 50 ? "text-orange-500" : "text-green-600")}>
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", utilizationColor)}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Saldo</p>
                        <p className="font-semibold text-gray-800 tabular-nums">{formatCurrency(card.saldoActual)}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Línea</p>
                        <p className="font-semibold text-gray-800 tabular-nums">{formatCurrency(card.lineaCredito)}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Tasa anual</p>
                        <p className="font-semibold text-gray-800">{card.tasaAnual}%</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Pago mínimo</p>
                        <p className="font-semibold text-gray-800 tabular-nums">{formatCurrency(card.pagoMinimo)}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Corte: día {card.fechaCorte}</span>
                      <span>Pago: día {card.fechaPago}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar tarjeta" : "Nueva tarjeta"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre de la tarjeta" placeholder="Ej. Visa Oro" {...field("nombre")} />
            <Input label="Banco" placeholder="Ej. BBVA" {...field("banco")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Línea de crédito ($)" type="number" placeholder="50000" {...field("lineaCredito")} />
            <Input label="Saldo actual ($)" type="number" placeholder="12000" {...field("saldoActual")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tasa anual (%)" type="number" placeholder="36.5" {...field("tasaAnual")} />
            <Input label="Pago mínimo ($)" type="number" placeholder="500" {...field("pagoMinimo")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Día de corte (1-31)" type="number" placeholder="5" {...field("fechaCorte")} />
            <Input label="Día de pago (1-31)" type="number" placeholder="25" {...field("fechaPago")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editing ? "Guardar cambios" : "Agregar tarjeta"}</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar tarjeta">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <p className="text-sm text-red-700">Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar esta tarjeta?</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { onDelete(confirmDelete!); setConfirmDelete(null); }}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
