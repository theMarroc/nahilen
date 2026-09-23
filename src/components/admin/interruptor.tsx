"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Interruptor que manda una server action en cuanto se toca.
 * El estado se actualiza al instante (optimista) y el servidor confirma.
 */
export function Interruptor({
  accion,
  campos,
  activo,
  etiqueta,
}: {
  accion: (datos: FormData) => Promise<void>;
  campos: Record<string, string>;
  activo: boolean;
  etiqueta: string;
}) {
  const [optimista, setOptimista] = useState(activo);
  const [ultimoDelServidor, setUltimoDelServidor] = useState(activo);

  // Cuando el servidor confirma (o corrige) el valor, se reemplaza el
  // optimista. Se ajusta durante el render, sin efectos de por medio.
  if (activo !== ultimoDelServidor) {
    setUltimoDelServidor(activo);
    setOptimista(activo);
  }

  return (
    <form action={accion} className="flex items-center">
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      {/* Valor objetivo: lo contrario de lo que está ahora. */}
      <input type="hidden" name="activo" value={optimista ? "false" : "true"} />

      <button
        type="submit"
        role="switch"
        aria-checked={optimista}
        aria-label={etiqueta}
        onClick={() => setOptimista((v) => !v)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          optimista ? "bg-oliva" : "bg-arena/45",
        )}
      >
        <span
          className={cn(
            // left-0 es clave: sin él, la posición de partida es el centro del
            // botón y la bolita se sale del carril al activarse.
            "absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            optimista ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </form>
  );
}
