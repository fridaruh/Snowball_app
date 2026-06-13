"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Landmark, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, cn } from "@/lib/utils";
import type { PersonalCredit } from "@/types";

interface Props {
  credits: PersonalCredit[];
  onAdd: (credit: Omit<PersonalCredit, "id" | "color">) => void;
  onUpdate: (id: string, updates: Partial<PersonalCredit>) => void;
  onDelete: (id: string) => void;
}

const emptyForm = {
  nombre: "",
  institucion: "",
  pagosTotales: "",
  tasa: "",
  pagosPendientes: "",
  pagoMensual: "",
};

type FormData = typeof emptyForm;

function validate(f: FormData) {
  const errors: Partial<FormData> = {};
  if (!f.nombre.trim()) errors.nombre = "Requerido";
  if (!f.institucion.trim()) errors.institucion = "Requerido";
  if (!f.pagosTotales || isNaN(Number(f.pagosTotales)) || Number(f.pagosTotales) < 1)
    errors.pagosTotales = "Número válido";
  if (!f.tasa || isNaN(Number(f.tasa))) errors.tasa = "Número válido";
  if (!f.pagosPendientes || isNaN(Number(f.pagosPendientes)) || Number(f.pagosPendientes) < 0)
    errors.pagosPendientes = "Número válido";
  if (Number(f.pagosPendientes) > Number(f.pagosTotales))
    errors.pagosPendientes = "No puede superar el total";
  if (!f.pagoMensual || isNaN(Number(f.pagoMensual)) || Number(f.pagoMensual) <= 0)
    errors.pagoMensual = "Número válido";
  return errors;
}

export function PersonalCreditManager({ credits, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalCredit | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (credit: PersonalCredit) => {
    setEditing(credit);
    setForm({
      nombre: credit.nombre,
      institucion: credit.institucion,
      pagosTotales: String(credit.pagosTotales),
      tasa: String(credit.tasa),
      pagosPendientes: String(credit.pagosPendientes),
      pagoMensual: String(credit.pagoMensual),
    });
    setErrors({});
    setOpen(true);
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      nombre: form.nombre.trim(),
      institucion: form.institucion.trim(),
      pagosTotales: Number(form.pagosTotales),
      tasa: Number(form.tasa),
      pagosPendientes: Number(form.pagosPendientes),
      pagoMensual: Number(form.pagoMensual),
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

  const totalDeuda = credits.reduce((s, c) => s + c.pagosPendientes * c.pagoMensual, 0);
  const totalMensual = credits.reduce((s, c) => s + (c.pagosPendientes > 0 ? c.pagoMensual : 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {credits.length === 0
            ? "Registra tus créditos personales"
            : `${credits.length} crédito${credits.length !== 1 ? "s" : ""} registrado${credits.length !== 1 ? "s" : ""}`}
        </p>
        <Button onClick={openNew} size="sm">
          <Plus size={14} />
          Nuevo crédito
        </Button>
      </div>

      {credits.length > 0 && (
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Deuda total restante</p>
            <p className="text-base font-bold text-gray-900 tabular-nums">{formatCurrency(totalDeuda)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Pago mensual total</p>
            <p className="text-base font-bold text-gray-900 tabular-nums">{formatCurrency(totalMensual)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Créditos activos</p>
            <p className="text-base font-bold text-gray-900">
              {credits.filter((c) => c.pagosPendientes > 0).length}
            </p>
          </div>
        </div>
      )}

      {credits.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Landmark size={32} className="mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">No hay créditos registrados</p>
          <p className="mt-1 text-xs text-gray-300">Agrega préstamos personales, hipotecas o cualquier crédito a plazos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {credits.map((credit) => {
            const pagosRealizados = credit.pagosTotales - credit.pagosPendientes;
            const avance = (pagosRealizados / credit.pagosTotales) * 100;
            const deudaRestante = credit.pagosPendientes * credit.pagoMensual;
            const tasaMensual = credit.tasa / 100 / 12;
            const interesProximoPago = deudaRestante * tasaMensual;
            const liquidado = credit.pagosPendientes === 0;

            return (
              <Card key={credit.id} className="overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: credit.color }} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{credit.nombre}</p>
                      <p className="text-xs text-gray-400">{credit.institucion}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {liquidado && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Liquidado
                        </span>
                      )}
                      <button
                        onClick={() => openEdit(credit)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(credit.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Barra de avance */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">
                          {pagosRealizados} de {credit.pagosTotales} pagos realizados
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            liquidado ? "text-green-600" : avance >= 50 ? "text-blue-600" : "text-gray-500"
                          )}
                        >
                          {avance.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            liquidado ? "bg-green-500" : avance >= 50 ? "bg-blue-500" : "bg-orange-400"
                          )}
                          style={{ width: `${Math.min(avance, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Pago mensual</p>
                        <p className="font-semibold text-gray-800 tabular-nums">
                          {formatCurrency(credit.pagoMensual)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Deuda restante</p>
                        <p className="font-semibold text-gray-800 tabular-nums">
                          {formatCurrency(deudaRestante)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Tasa anual</p>
                        <p className="font-semibold text-gray-800">{credit.tasa}%</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-gray-400">Interés próx. pago</p>
                        <p className="font-semibold text-gray-800 tabular-nums">
                          {formatCurrency(interesProximoPago)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Pagos pendientes: <span className="font-medium text-gray-600">{credit.pagosPendientes}</span></span>
                      <span>Totales: <span className="font-medium text-gray-600">{credit.pagosTotales}</span></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar crédito" : "Nuevo crédito personal"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Nombre del crédito" placeholder="Ej. Préstamo personal" {...field("nombre")} />
            <Input label="Institución" placeholder="Ej. HSBC" {...field("institucion")} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="No. de pagos totales" type="number" placeholder="36" {...field("pagosTotales")} />
            <Input label="No. de pagos pendientes" type="number" placeholder="24" {...field("pagosPendientes")} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Tasa anual (%)" type="number" placeholder="18.5" {...field("tasa")} />
            <Input label="Pago mensual ($)" type="number" placeholder="3500" {...field("pagoMensual")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editing ? "Guardar cambios" : "Agregar crédito"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar crédito">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <AlertTriangle size={16} className="shrink-0 text-red-500" />
            <p className="text-sm text-red-700">
              Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este crédito?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => { onDelete(confirmDelete!); setConfirmDelete(null); }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
