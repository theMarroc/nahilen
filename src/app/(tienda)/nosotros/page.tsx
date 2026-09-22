import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BarraBeneficios } from "@/components/home/barra-beneficios";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { estilosBoton } from "@/components/ui/boton";
import { Isotipo } from "@/components/ui/marca";
import { getAjustes, getBeneficios } from "@/lib/db";
import { ajuste, ajusteCrudo } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Nosotros",
};

export default async function PaginaNosotros() {
  const [ajustes, beneficios] = await Promise.all([getAjustes(), getBeneficios()]);
  const imagen = ajusteCrudo(ajustes, "hero_imagen");

  return (
    <>
      <CabeceraPagina
        titulo={ajuste(ajustes, "nosotros_titulo")}
        tituloCursiva={ajuste(ajustes, "nosotros_titulo_cursiva")}
        texto={ajuste(ajustes, "marca_claim")}
      />

      <section className="contenedor grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-4/5 overflow-hidden rounded-marca bg-beige/40">
          {imagen ? (
            <Image
              src={imagen}
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "radial-gradient(120% 90% at 30% 20%, #F2E9DE 0%, #E0C9A6 45%, #A88D74 100%)",
              }}
            >
              <Isotipo className="h-16 w-16 text-white/70" />
            </div>
          )}
        </div>

        <div>
          <h2 className="titulo-seccion text-marron">
            Lo simple es <span className="italic text-terracota">hermoso</span>
          </h2>
          <span className="linea-decorativa mt-5" />

          <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-carbon/75">
            {ajuste(ajustes, "nosotros_texto")
              .split(/\n{2,}/)
              .map((parrafo, indice) => (
                <p key={indice}>{parrafo}</p>
              ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tienda" className={estilosBoton("primario", "md")}>
              Ver la tienda
            </Link>
            <Link href="/contacto" className={estilosBoton("secundario", "md")}>
              Hablemos
            </Link>
          </div>
        </div>
      </section>

      <BarraBeneficios beneficios={beneficios} />
    </>
  );
}
