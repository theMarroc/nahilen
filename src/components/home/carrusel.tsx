import Image from "next/image";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { ajuste } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export type FotoCarrusel = { id: string; url: string; caption: string | null };

export function Carrusel({
  fotos,
  ajustes,
}: {
  fotos: FotoCarrusel[];
  ajustes: Settings;
}) {
  if (fotos.length === 0) return null;

  // La lista se duplica para que el desplazamiento no tenga cortes visibles.
  const tira = [...fotos, ...fotos];

  return (
    <section className="overflow-hidden bg-crema py-16 lg:py-20">
      <div className="contenedor">
        <EncabezadoSeccion
          titulo={ajuste(ajustes, "carrusel_titulo")}
          tituloCursiva={ajuste(ajustes, "carrusel_titulo_cursiva")}
          centrado
        />
      </div>

      <div className="group mt-10 overflow-hidden">
        <div className="marquesina flex gap-4 group-hover:[animation-play-state:paused]">
          {tira.map((foto, indice) => (
            <figure
              key={`${foto.id}-${indice}`}
              className="relative h-56 w-44 shrink-0 overflow-hidden rounded-marca bg-beige/40 sm:h-72 sm:w-56"
            >
              <Image
                src={foto.url}
                alt={foto.caption ?? ""}
                fill
                sizes="224px"
                className="object-cover"
              />
              {foto.caption ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-carbon/70 to-transparent p-3 text-xs text-white">
                  {foto.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
