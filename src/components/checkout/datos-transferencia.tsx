"use client";

import { Check, Copy, Landmark } from "lucide-react";
import { useState } from "react";

import { formatARS } from "@/lib/utils";

/** Muestra los datos bancarios con un botón para copiar cada uno. */
export function DatosTransferencia({
  titular,
  alias,
  cbu,
  banco,
  monto,
  codigo,
}: {
  titular: string;
  alias: string;
  cbu: string;
  banco: string;
  monto: number;
  codigo: string;
}) {
  const filas = [
    { etiqueta: "Alias", valor: alias },
    { etiqueta: "CBU / CVU", valor: cbu },
    { etiqueta: "Titular", valor: titular },
    { etiqueta: "Banco", valor: banco },
  ].filter((fila) => fila.valor);

  return (
    <div className="rounded-marca border border-mostaza/50 bg-mostaza/12 p-6">
      <h2 className="flex items-center gap-2 font-display text-xl text-marron">
        <Landmark className="h-5 w-5" strokeWidth={1.4} />
        Datos para transferir
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-carbon/75">
        Transferí <strong className="font-semibold">{formatARS(monto)}</strong> y poné{" "}
        <strong className="font-semibold">{codigo}</strong> como referencia si tu banco lo
        permite.
      </p>

      {filas.length === 0 ? (
        <p className="mt-4 rounded-marca border border-terracota/40 bg-white px-4 py-3 text-sm text-terracota-oscuro">
          Todavía no están cargados los datos bancarios. Escribinos por WhatsApp y te los
          pasamos.
        </p>
      ) : (
        <dl className="mt-4 flex flex-col gap-2">
          {filas.map((fila) => (
            <FilaCopiable key={fila.etiqueta} etiqueta={fila.etiqueta} valor={fila.valor} />
          ))}
        </dl>
      )}
    </div>
  );
}

function FilaCopiable({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-marca bg-white px-4 py-2.5">
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-arena">
          {etiqueta}
        </dt>
        <dd className="truncate font-mono text-sm text-carbon">{valor}</dd>
      </div>

      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            window.setTimeout(() => setCopiado(false), 1600);
          } catch {
            // Algunos navegadores bloquean el portapapeles: se copia a mano.
          }
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-marca border border-arena/40 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-marron transition-colors hover:border-terracota hover:text-terracota"
        aria-label={`Copiar ${etiqueta}`}
      >
        {copiado ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copiado
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copiar
          </>
        )}
      </button>
    </div>
  );
}
