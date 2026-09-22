import Link from "next/link";
import type { ReactNode } from "react";

import { BarraBeneficios } from "@/components/home/barra-beneficios";
import { Carrusel, type FotoCarrusel } from "@/components/home/carrusel";
import { SeccionCategorias } from "@/components/home/categorias";
import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { FranjaFrase } from "@/components/home/franja-frase";
import { MapaDelivery } from "@/components/home/mapa-delivery";
import { Newsletter } from "@/components/home/newsletter";
import { Portada } from "@/components/home/portada";
import { SeccionPreguntas } from "@/components/home/preguntas";
import { GrillaProductos, TarjetaCombo } from "@/components/shop/tarjeta-producto";
import { AvisoDemo } from "@/components/site/aviso-demo";
import { estilosBoton } from "@/components/ui/boton";
import {
  getAjustes,
  getBeneficios,
  getCategorias,
  getCombos,
  getFaqs,
  getGaleria,
  getOfertas,
  getProductos,
  getSecciones,
  modoDemo,
} from "@/lib/db";
import { calcularPrecio } from "@/lib/pricing";
import { ajuste } from "@/lib/settings";

export default async function Inicio() {
  const [
    ajustes,
    secciones,
    categorias,
    destacados,
    todos,
    ofertas,
    combos,
    beneficios,
    preguntas,
    galeria,
  ] = await Promise.all([
    getAjustes(),
    getSecciones(),
    getCategorias(),
    getProductos({ destacados: true }),
    getProductos(),
    getOfertas(),
    getCombos(),
    getBeneficios(),
    getFaqs(),
    getGaleria(),
  ]);

  const enOferta = todos.filter((p) => calcularPrecio(p, ofertas).oferta !== null);

  // El carrusel usa la galeria del panel; si esta vacia, cae en las fotos
  // de los productos para no quedar en blanco.
  const fotos: FotoCarrusel[] = galeria.length
    ? galeria.map((g) => ({ id: g.id, url: g.url, caption: g.caption }))
    : todos
        .filter((p) => p.images[0])
        .slice(0, 8)
        .map((p) => ({ id: p.id, url: p.images[0].url, caption: p.name }));

  const bloques: Record<string, ReactNode> = {
    hero: <Portada ajustes={ajustes} />,
    barra_beneficios: <BarraBeneficios beneficios={beneficios} />,
    categorias: <SeccionCategorias categorias={categorias} ajustes={ajustes} />,
    destacados:
      destacados.length > 0 ? (
        <section className="bg-crema py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "destacados_titulo")}
                tituloCursiva={ajuste(ajustes, "destacados_titulo_cursiva")}
              />
              <Link href="/tienda" className={estilosBoton("secundario", "md")}>
                Ver la tienda
              </Link>
            </div>
            <div className="mt-10">
              <GrillaProductos productos={destacados.slice(0, 8)} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null,
    ofertas:
      enOferta.length > 0 ? (
        <section className="bg-crema-claro py-16 lg:py-24">
          <div className="contenedor">
            <EncabezadoSeccion
              titulo={ajuste(ajustes, "ofertas_titulo")}
              tituloCursiva={ajuste(ajustes, "ofertas_titulo_cursiva")}
              centrado
              className="mx-auto"
            />
            <div className="mt-10">
              <GrillaProductos productos={enOferta.slice(0, 8)} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null,
    combos:
      combos.length > 0 ? (
        <section className="bg-crema py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "combos_titulo")}
                tituloCursiva={ajuste(ajustes, "combos_titulo_cursiva")}
              />
              <Link href="/combos" className={estilosBoton("secundario", "md")}>
                Ver todos
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {combos.slice(0, 4).map((combo) => (
                <TarjetaCombo key={combo.id} combo={combo} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    carrusel: <Carrusel fotos={fotos} ajustes={ajustes} />,
    frase: <FranjaFrase ajustes={ajustes} />,
    mapa_delivery: <MapaDelivery ajustes={ajustes} />,
    faq: <SeccionPreguntas preguntas={preguntas} ajustes={ajustes} />,
    newsletter: <Newsletter ajustes={ajustes} />,
  };

  const visibles = secciones
    .filter((seccion) => seccion.is_enabled && bloques[seccion.key])
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {modoDemo() ? <AvisoDemo /> : null}
      {visibles.map((seccion) => (
        <div key={seccion.key}>{bloques[seccion.key]}</div>
      ))}
    </>
  );
}
