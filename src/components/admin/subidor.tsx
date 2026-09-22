"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";

const BUCKET = "productos";
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAXIMO = 6 * 1024 * 1024;

async function subirArchivo(archivo: File, carpeta: string) {
  if (!TIPOS.includes(archivo.type)) {
    throw new Error("Solo se pueden subir imágenes JPG, PNG, WEBP o AVIF.");
  }
  if (archivo.size > MAXIMO) {
    throw new Error("La imagen pesa más de 6 MB. Probá con una más chica.");
  }

  const supabase = createClient();
  const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = slugify(archivo.name.replace(/\.[^.]+$/, "")) || "foto";
  const ruta = `${carpeta}/${Date.now()}-${base}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, archivo, { contentType: archivo.type, upsert: false });

  if (error) {
    throw new Error(
      "No se pudo subir la imagen. Revisá que el bucket 'productos' exista en Supabase.",
    );
  }

  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

/* ========================================================================== */

/** Subidor de una sola imagen. Deja la URL en un input oculto. */
export function SubidorImagen({
  nombre,
  valorInicial = "",
  carpeta = "varios",
  etiqueta = "Imagen",
  ayuda,
}: {
  nombre: string;
  valorInicial?: string;
  carpeta?: string;
  etiqueta?: string;
  ayuda?: string;
}) {
  const [url, setUrl] = useState(valorInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      <span className="mb-1.5 flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-marron">
          {etiqueta}
        </span>
        {ayuda ? <span className="text-xs text-arena">{ayuda}</span> : null}
      </span>

      <input type="hidden" name={nombre} value={url} />

      {url ? (
        <div className="relative h-40 w-full overflow-hidden rounded-marca border border-arena/30 bg-beige/30 sm:w-64">
          <Image src={url} alt="" fill sizes="256px" className="object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-terracota shadow-sm transition-colors hover:bg-white"
            aria-label="Quitar la imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-marca border border-dashed border-arena/60 bg-crema/50 text-center transition-colors hover:border-terracota hover:bg-terracota/5 sm:w-64",
            subiendo && "pointer-events-none opacity-60",
          )}
        >
          {subiendo ? (
            <Loader2 className="h-6 w-6 animate-spin text-arena" />
          ) : (
            <ImagePlus className="h-6 w-6 text-arena" strokeWidth={1.3} />
          )}
          <span className="text-xs font-semibold text-marron">
            {subiendo ? "Subiendo..." : "Elegir imagen"}
          </span>
          <input
            type="file"
            accept={TIPOS.join(",")}
            className="sr-only"
            onChange={async (evento) => {
              const archivo = evento.target.files?.[0];
              if (!archivo) return;
              setError(null);
              setSubiendo(true);
              try {
                setUrl(await subirArchivo(archivo, carpeta));
              } catch (fallo) {
                setError(fallo instanceof Error ? fallo.message : "Error al subir.");
              } finally {
                setSubiendo(false);
              }
            }}
          />
        </label>
      )}

      {error ? (
        <p className="mt-2 text-xs text-terracota-oscuro">{error}</p>
      ) : null}
    </div>
  );
}

/* ========================================================================== */

export type ImagenEditor = { url: string; alt: string };

/**
 * Galería del producto: varias imágenes ordenables.
 * Todo se guarda en un input oculto con JSON, así funciona también para
 * productos que todavía no existen en la base.
 */
export function GestorImagenes({
  nombre = "imagenes",
  iniciales = [],
  carpeta = "productos",
}: {
  nombre?: string;
  iniciales?: ImagenEditor[];
  carpeta?: string;
}) {
  const [imagenes, setImagenes] = useState<ImagenEditor[]>(iniciales);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mover(desde: number, hacia: number) {
    if (hacia < 0 || hacia >= imagenes.length) return;
    const copia = [...imagenes];
    const [movida] = copia.splice(desde, 1);
    copia.splice(hacia, 0, movida);
    setImagenes(copia);
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={nombre} value={JSON.stringify(imagenes)} />

      {imagenes.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imagenes.map((imagen, indice) => (
            <li
              key={imagen.url}
              className="overflow-hidden rounded-marca border border-arena/30 bg-white"
            >
              <div className="relative aspect-4/5 bg-beige/30">
                <Image
                  src={imagen.url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {indice === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-mostaza px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-carbon">
                    Principal
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => mover(indice, indice - 1)}
                    disabled={indice === 0}
                    className="rounded-marca p-1.5 text-arena transition-colors hover:bg-beige/50 hover:text-marron disabled:opacity-30"
                    aria-label="Mover antes"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(indice, indice + 1)}
                    disabled={indice === imagenes.length - 1}
                    className="rounded-marca p-1.5 text-arena transition-colors hover:bg-beige/50 hover:text-marron disabled:opacity-30"
                    aria-label="Mover después"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setImagenes(imagenes.filter((_, i) => i !== indice))
                  }
                  className="rounded-marca p-1.5 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                  aria-label="Quitar la imagen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-marca border border-dashed border-arena/60 bg-crema/50 px-4 py-8 text-center transition-colors hover:border-terracota hover:bg-terracota/5",
          subiendo && "pointer-events-none opacity-60",
        )}
      >
        {subiendo ? (
          <Loader2 className="h-6 w-6 animate-spin text-arena" />
        ) : (
          <ImagePlus className="h-6 w-6 text-arena" strokeWidth={1.3} />
        )}
        <span className="text-sm font-semibold text-marron">
          {subiendo ? "Subiendo..." : "Agregar fotos"}
        </span>
        <span className="text-xs text-arena">
          La primera es la que se ve en la tienda. JPG, PNG o WEBP, hasta 6 MB.
        </span>
        <input
          type="file"
          multiple
          accept={TIPOS.join(",")}
          className="sr-only"
          onChange={async (evento) => {
            const archivos = Array.from(evento.target.files ?? []);
            if (archivos.length === 0) return;
            setError(null);
            setSubiendo(true);
            try {
              const nuevas: ImagenEditor[] = [];
              for (const archivo of archivos) {
                nuevas.push({ url: await subirArchivo(archivo, carpeta), alt: "" });
              }
              setImagenes((actuales) => [...actuales, ...nuevas]);
            } catch (fallo) {
              setError(fallo instanceof Error ? fallo.message : "Error al subir.");
            } finally {
              setSubiendo(false);
              evento.target.value = "";
            }
          }}
        />
      </label>

      {error ? <p className="text-xs text-terracota-oscuro">{error}</p> : null}
    </div>
  );
}
