import Image from "next/image";
import Link from "next/link";

import { estilosBoton } from "@/components/ui/boton";
import { Isotipo } from "@/components/ui/marca";
import { ajuste, ajusteCrudo } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export function Portada({ ajustes }: { ajustes: Settings }) {
  const imagen = ajusteCrudo(ajustes, "hero_imagen");

  return (
    <section className="border-b border-arena/25 bg-crema">
      <div className="mx-auto grid w-full max-w-[110rem] items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
          <h1 className="font-display text-[clamp(2.25rem,1.5rem+3.2vw,4rem)] leading-[1.08] text-marron">
            {ajuste(ajustes, "hero_titulo")}
            <br />
            <span className="italic text-terracota">
              {ajuste(ajustes, "hero_titulo_cursiva")}
            </span>
          </h1>

          <span className="linea-decorativa mt-7" />

          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-carbon/75">
            {ajuste(ajustes, "hero_texto")}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={ajuste(ajustes, "hero_cta_link")}
              className={estilosBoton("primario", "lg")}
            >
              {ajuste(ajustes, "hero_cta_texto")}
            </Link>
            <Link href="/combos" className={estilosBoton("secundario", "lg")}>
              Ver combos
            </Link>
          </div>
        </div>

        <div className="relative min-h-[18rem] overflow-hidden bg-beige/50 lg:min-h-[34rem]">
          {imagen ? (
            <Image
              src={imagen}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <DecoradoPortada />
          )}
        </div>
      </div>
    </section>
  );
}

/** Fondo decorativo mientras no haya una foto cargada en el panel. */
function DecoradoPortada() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 90% at 20% 10%, #F2E9DE 0%, #E0C9A6 42%, #C97A4E 100%)",
      }}
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-25"
        aria-hidden="true"
      >
        <g stroke="#5B3E2A" strokeWidth="1" fill="none">
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="118" />
          <circle cx="200" cy="200" r="86" />
        </g>
      </svg>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <Isotipo className="h-14 w-14 text-white/85" />
        <p className="max-w-56 text-xs uppercase tracking-[0.2em] text-white/85">
          Subí tu foto de portada desde el panel
        </p>
      </div>
    </div>
  );
}
