"use client";
import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { Upload, FileText, Download, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CSV_TEMPLATE, CSV_COLUMNS } from "@/lib/csvTemplate";
import type { Transaction } from "@/types";

interface CSVUploaderProps {
  onImport: (transactions: Transaction[]) => void;
}

type ParsedRow = {
  fecha?: string;
  tipo?: string;
  categoria?: string;
  descripcion?: string;
  monto?: string;
  moneda?: string;
};

export function CSVUploader({ onImport }: CSVUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<{ ok: number; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      Papa.parse<ParsedRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const transactions: Transaction[] = [];
          const errors: string[] = [];

          results.data.forEach((row, i) => {
            const lineNum = i + 2;
            if (!row.fecha || !row.tipo || !row.monto) {
              errors.push(`Línea ${lineNum}: faltan campos obligatorios (fecha, tipo, monto)`);
              return;
            }
            if (row.tipo !== "ingreso" && row.tipo !== "egreso") {
              errors.push(`Línea ${lineNum}: tipo debe ser "ingreso" o "egreso"`);
              return;
            }
            const monto = parseFloat(row.monto.replace(/,/g, ""));
            if (isNaN(monto) || monto <= 0) {
              errors.push(`Línea ${lineNum}: monto inválido "${row.monto}"`);
              return;
            }
            transactions.push({
              id: crypto.randomUUID(),
              fecha: row.fecha.trim(),
              tipo: row.tipo as "ingreso" | "egreso",
              categoria: row.categoria?.trim() || "sin categoría",
              descripcion: row.descripcion?.trim() || "",
              monto,
              moneda: row.moneda?.trim().toUpperCase() || "MXN",
            });
          });

          setResult({ ok: transactions.length, errors: errors.slice(0, 5) });
          if (transactions.length > 0) onImport(transactions);
        },
        error: (err) => {
          setResult({ ok: 0, errors: [`Error al leer el archivo: ${err.message}`] });
        },
      });
    },
    [onImport]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".csv")) processFile(file);
    },
    [processFile]
  );

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finbot_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
        <Upload className="mx-auto mb-3 text-gray-300" size={32} />
        <p className="text-sm font-medium text-gray-700">
          Arrastra tu CSV aquí o <span className="text-gray-900 underline">haz clic para seleccionar</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">Solo archivos .csv</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-3 rounded-xl p-4 ${result.errors.length > 0 && result.ok === 0 ? "bg-red-50" : "bg-green-50"}`}>
          {result.ok > 0 ? (
            <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-600" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          )}
          <div className="flex-1 text-sm">
            {result.ok > 0 && (
              <p className="font-medium text-green-700">{result.ok} transacciones importadas correctamente</p>
            )}
            {result.errors.map((e, i) => (
              <p key={i} className="text-red-600">{e}</p>
            ))}
          </div>
          <button onClick={() => { setResult(null); setFileName(null); }} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Template section */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Estructura del CSV</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  El archivo debe tener las columnas: {CSV_COLUMNS.map((c) => c.nombre).join(", ")}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={downloadTemplate} className="shrink-0">
              <Download size={13} />
              Descargar plantilla
            </Button>
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg bg-gray-50 p-3">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {CSV_COLUMNS.map((col) => (
                    <th key={col.nombre} className="px-2 py-1 text-left font-semibold text-gray-500">
                      {col.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  {CSV_COLUMNS.map((col) => (
                    <td key={col.nombre} className="px-2 py-1 text-gray-600">
                      {col.ejemplo}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
