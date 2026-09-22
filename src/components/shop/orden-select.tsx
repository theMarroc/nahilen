"use client";

import { useRouter, useSearchParams } from "next/navigation";

export const ORDENES = [
  { valor: "recomendado", texto: "Recomendados" },
  { valor: "precio-asc", texto: "Menor precio" },
  { valor: "precio-desc", texto: "Mayor precio" },
  { valor: "nombre", texto: "Nombre (A-Z)" },
  { valor: "nuevos", texto: "Más nuevos" },
] as const;

export function OrdenSelect({ valorActual }: { valorActual: string }) {
  const router = useRouter();
  const parametros = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-arena">
      Ordenar por
      <select
        value={valorActual}
        onChange={(evento) => {
          const nuevos = new URLSearchParams(parametros.toString());
          if (evento.target.value === "recomendado") {
            nuevos.delete("orden");
          } else {
            nuevos.set("orden", evento.target.value);
          }
          const consulta = nuevos.toString();
          router.push(consulta ? `/tienda?${consulta}` : "/tienda");
        }}
        className="rounded-marca border border-arena/45 bg-white px-2.5 py-1.5 text-xs normal-case tracking-normal text-carbon focus:border-terracota focus:outline-none"
      >
        {ORDENES.map((orden) => (
          <option key={orden.valor} value={orden.valor}>
            {orden.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
