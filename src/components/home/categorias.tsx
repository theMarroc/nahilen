import Image from "next/image";
import Link from "next/link";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { estilosBoton } from "@/components/ui/boton";
import { PlaceholderImagen } from "@/components/ui/marca";
import { ajuste } from "@/lib/settings";
import type { Category, Settings } from "@/lib/types";

export function SeccionCategorias({
  categorias,
  ajustes,
}: {
  categorias: Category[];
  ajustes: Settings;
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="bg-crema-claro py-16 lg:py-24">
      <div className="contenedor grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-14">
        <div className="flex flex-col justify-center">
          <EncabezadoSeccion
            titulo={ajuste(ajustes, "categorias_titulo")}
            tituloCursiva={ajuste(ajustes, "categorias_titulo_cursiva")}
            texto={ajuste(ajustes, "categorias_texto")}
          />
          <Link
            href="/tienda"
            className={estilosBoton("secundario", "md", "mt-8 self-start")}
          >
            Ver todo
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {categorias.slice(0, 3).map((categoria) => (
            <Link
              key={categoria.id}
              href={`/tienda?categoria=${categoria.slug}`}
              className="group relative block aspect-3/4 overflow-hidden rounded-marca bg-beige/40"
            >
              {categoria.image_url ? (
                <Image
                  src={categoria.image_url}
                  alt={categoria.name}
                  fill
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <PlaceholderImagen texto={categoria.name} />
              )}

              <span className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-carbon/75 to-transparent" />

              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-display text-2xl text-white drop-shadow-sm">
                  {categoria.name}
                </span>
                {categoria.description ? (
                  <span className="mt-1 block text-xs leading-snug text-white/80">
                    {categoria.description}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
