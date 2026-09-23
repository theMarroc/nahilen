"use client";

import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";

import { confirmarComprobante, prepararSubidaComprobante } from "@/actions/pedidos";
import { Boton } from "@/components/ui/boton";
import { comprimirImagen, formatearPeso } from "@/lib/imagenes";
import { createClient } from "@/lib/supabase/client";

type Fase = "elegir" | "optimizando" | "subiendo" | "confirmando" | "listo";

const TEXTO_FASE: Record<Fase, string> = {
  elegir: "Enviar comprobante",
  optimizando: "Preparando la foto...",
  subiendo: "Subiendo...",
  confirmando: "Confirmando...",
  listo: "Enviado",
};

/** Error con un mensaje pensado para mostrarle al cliente tal cual. */
class ErrorParaMostrar extends Error {}

/**
 * El archivo va directo del navegador a Supabase con una URL firmada, sin
 * pasar por una Server Action (que corta en 1 MB). Ver actions/pedidos.ts.
 */
export function SubirComprobante({
  codigo,
  token,
  yaSubido,
}: {
  codigo: string;
  token: string;
  yaSubido: boolean;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fase, setFase] = useState<Fase>(yaSubido ? "listo" : "elegir");
  const [error, setError] = useState<string | null>(null);
  const [optimizacion, setOptimizacion] = useState<string | null>(null);

  const ocupado = fase !== "elegir" && fase !== "listo";

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!archivo) {
      setError("Elegí una foto o un PDF del comprobante.");
      return;
    }

    setError(null);
    setOptimizacion(null);

    try {
      setFase("optimizando");
      const comprimido = await comprimirImagen(archivo);
      if (comprimido.achicada) {
        setOptimizacion(
          `Foto optimizada: ${formatearPeso(comprimido.pesoOriginal)} → ${formatearPeso(comprimido.pesoFinal)}`,
        );
      }

      setFase("subiendo");
      const permiso = await prepararSubidaComprobante(codigo, token, {
        tipo: comprimido.tipo,
        peso: comprimido.pesoFinal,
      });
      if (!permiso.ok) throw new ErrorParaMostrar(permiso.mensaje);

      const { error: errorSubida } = await createClient()
        .storage.from("comprobantes")
        .uploadToSignedUrl(permiso.ruta, permiso.tokenSubida, comprimido.archivo, {
          contentType: comprimido.tipo,
        });
      if (errorSubida) {
        throw new ErrorParaMostrar(
          "No pudimos subir el archivo. Revisá tu conexión y probá de nuevo.",
        );
      }

      setFase("confirmando");
      const resultado = await confirmarComprobante(codigo, token, permiso.ruta);
      if (!resultado.ok) throw new ErrorParaMostrar(resultado.mensaje);

      setFase("listo");
    } catch (fallo) {
      setError(
        fallo instanceof ErrorParaMostrar
          ? fallo.message
          : "Algo falló al enviar el comprobante. Probá de nuevo o mandánoslo por WhatsApp.",
      );
      setFase("elegir");
    }
  }

  if (fase === "listo") {
    return (
      <div className="flex items-start gap-3 rounded-marca border border-oliva/40 bg-oliva/10 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-oliva" strokeWidth={1.5} />
        <div>
          <p className="font-semibold text-oliva">Comprobante recibido</p>
          <p className="mt-1 text-sm leading-relaxed text-carbon/75">
            Ya lo estamos revisando. En cuanto lo confirmemos te escribimos por WhatsApp
            para coordinar la entrega.
          </p>
          {optimizacion ? <p className="mt-2 text-xs text-arena">{optimizacion}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-marca border border-arena/30 bg-white p-6 shadow-suave"
    >
      <h2 className="flex items-center gap-2 font-display text-xl text-marron">
        <Upload className="h-5 w-5" strokeWidth={1.4} />
        Subí el comprobante
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-carbon/70">
        Es el paso que reserva tu pedido. Podés subir una foto, una captura o el PDF que
        te da el banco.
      </p>

      <label
        className={`mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-marca border border-dashed border-arena/60 bg-crema/50 px-4 py-8 text-center transition-colors hover:border-terracota hover:bg-terracota/5 ${
          ocupado ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <Upload className="h-7 w-7 text-arena" strokeWidth={1.3} />
        <span className="text-sm font-semibold text-marron">
          {archivo ? archivo.name : "Elegir archivo"}
        </span>
        <span className="text-xs text-arena">
          Fotos de cualquier tamaño (se achican solas) o PDF de hasta 8 MB
        </span>
        <input
          type="file"
          name="archivo"
          accept="image/*,application/pdf"
          disabled={ocupado}
          onChange={(evento) => {
            setArchivo(evento.target.files?.[0] ?? null);
            setError(null);
          }}
          className="sr-only"
        />
      </label>

      {error ? (
        <p
          aria-live="polite"
          className="mt-3 flex items-start gap-2 rounded-marca border border-terracota/40 bg-terracota/10 px-3 py-2 text-xs leading-relaxed text-terracota-oscuro"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      ) : null}

      <Boton type="submit" className="mt-4 w-full" disabled={ocupado || !archivo}>
        {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {TEXTO_FASE[fase]}
      </Boton>
    </form>
  );
}
