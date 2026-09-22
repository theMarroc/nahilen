"use client";

import { CheckCircle2, Upload } from "lucide-react";
import { useActionState, useState } from "react";

import { subirComprobante } from "@/actions/pedidos";
import { Boton } from "@/components/ui/boton";

export function SubirComprobante({
  codigo,
  token,
  yaSubido,
}: {
  codigo: string;
  token: string;
  yaSubido: boolean;
}) {
  const [estado, accion, enviando] = useActionState<
    { ok: boolean; mensaje: string } | null,
    FormData
  >(subirComprobante, null);

  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const listo = estado?.ok || (yaSubido && !estado);

  if (listo) {
    return (
      <div className="flex items-start gap-3 rounded-marca border border-oliva/40 bg-oliva/10 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-oliva" strokeWidth={1.5} />
        <div>
          <p className="font-semibold text-oliva">Comprobante recibido</p>
          <p className="mt-1 text-sm leading-relaxed text-carbon/75">
            Ya lo estamos revisando. En cuanto lo confirmemos te escribimos por WhatsApp
            para coordinar la entrega.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={accion}
      className="rounded-marca border border-arena/30 bg-white p-6 shadow-suave"
    >
      <input type="hidden" name="codigo" value={codigo} />
      <input type="hidden" name="token" value={token} />

      <h2 className="flex items-center gap-2 font-display text-xl text-marron">
        <Upload className="h-5 w-5" strokeWidth={1.4} />
        Subí el comprobante
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-carbon/70">
        Es el paso que reserva tu pedido. Podés subir una foto, una captura o el PDF que
        te da el banco.
      </p>

      <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-marca border border-dashed border-arena/60 bg-crema/50 px-4 py-8 text-center transition-colors hover:border-terracota hover:bg-terracota/5">
        <Upload className="h-7 w-7 text-arena" strokeWidth={1.3} />
        <span className="text-sm font-semibold text-marron">
          {nombreArchivo ?? "Elegir archivo"}
        </span>
        <span className="text-xs text-arena">JPG, PNG, WEBP o PDF — hasta 8 MB</span>
        <input
          type="file"
          name="archivo"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(evento) =>
            setNombreArchivo(evento.target.files?.[0]?.name ?? null)
          }
          className="sr-only"
        />
      </label>

      {estado && !estado.ok ? (
        <p
          aria-live="polite"
          className="mt-3 rounded-marca border border-terracota/40 bg-terracota/10 px-3 py-2 text-xs text-terracota-oscuro"
        >
          {estado.mensaje}
        </p>
      ) : null}

      <Boton type="submit" className="mt-4 w-full" disabled={enviando}>
        {enviando ? "Subiendo..." : "Enviar comprobante"}
      </Boton>
    </form>
  );
}
