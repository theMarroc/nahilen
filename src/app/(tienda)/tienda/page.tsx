import type { Metadata } from "next";
import Link from "next/link";

import { OrdenSelect } from "@/components/shop/orden-select";
import { GrillaProductos } from "@/components/shop/tarjeta-producto";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getCategorias, getOfertas, getProductos } from "@/lib/db";
import { calcularPrecio } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Mermeladas, budines y cajas para regalar, hechos a mano.",
};

type Parametros = {
  categoria?: string;
  q?: string;
  orden?: string;
  oferta?: string;
};

export default async function Tienda({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  const { categoria, q, orden = "recomendado", oferta } = await searchParams;

  const [categorias, ofertas, productos] = await Promise.all([
    getCategorias(),
    getOfertas(),
    getProductos({ categoria, buscar: q }),
  ]);

  const conPrecio = productos.map((producto) => ({
    producto,
    precio: calcularPrecio(producto, ofertas),
  }));

  const filtrados = oferta === "1" ? conPrecio.filter((p) => p.precio.oferta) : conPrecio;

  const ordenados = [...filtrados].sort((a, b) => {
    switch (orden) {
      case "precio-asc":
        return a.precio.final - b.precio.final;
      case "precio-desc":
        return b.precio.final - a.precio.final;
      case "nombre":
        return a.producto.name.localeCompare(b.producto.name, "es");
      case "nuevos":
        return (
          new Date(b.producto.created_at).getTime() -
          new Date(a.producto.created_at).getTime()
        );
      default:
        return a.producto.sort_order - b.producto.sort_order;
    }
  });

  const categoriaActual = categorias.find((c) => c.slug === categoria);

  const enlaceFiltro = (nuevos: Partial<Parametros>) => {
    const parametros = new URLSearchParams();
    const combinados = { categoria, q, orden, oferta, ...nuevos };
    if (combinados.categoria) parametros.set("categoria", combinados.categoria);
    if (combinados.q) parametros.set("q", combinados.q);
    if (combinados.orden && combinados.orden !== "recomendado") {
      parametros.set("orden", combinados.orden);
    }
    if (combinados.oferta === "1") parametros.set("oferta", "1");
    const consulta = parametros.toString();
    return consulta ? `/tienda?${consulta}` : "/tienda";
  };

  return (
    <>
      <CabeceraPagina
        titulo={categoriaActual ? categoriaActual.name : "Nuestra"}
        tituloCursiva={categoriaActual ? undefined : "tienda"}
        texto={
          categoriaActual?.description ??
          "Todo se elabora en tandas chicas. Si buscás algo que no está en la lista, escribinos."
        }
        migas={
          categoriaActual
            ? [{ href: "/tienda", texto: "Tienda" }]
            : undefined
        }
      />

      <div className="contenedor py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={enlaceFiltro({ categoria: undefined, oferta: undefined })}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                !categoria && oferta !== "1"
                  ? "border-carbon bg-carbon text-crema"
                  : "border-arena/45 text-carbon/70 hover:border-carbon hover:text-carbon",
              )}
            >
              Todo
            </Link>

            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={enlaceFiltro({ categoria: cat.slug, oferta: undefined })}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                  categoria === cat.slug
                    ? "border-carbon bg-carbon text-crema"
                    : "border-arena/45 text-carbon/70 hover:border-carbon hover:text-carbon",
                )}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              href={enlaceFiltro({ oferta: oferta === "1" ? undefined : "1" })}
              className={cn(
                "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                oferta === "1"
                  ? "border-terracota bg-terracota text-white"
                  : "border-terracota/50 text-terracota-oscuro hover:bg-terracota/10",
              )}
            >
              En oferta
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-arena/25 pt-4">
            <p className="text-sm text-arena">
              {ordenados.length}{" "}
              {ordenados.length === 1 ? "producto" : "productos"}
              {q ? (
                <>
                  {" "}
                  para <span className="font-semibold text-marron">&ldquo;{q}&rdquo;</span>{" "}
                  <Link href={enlaceFiltro({ q: undefined })} className="underline">
                    limpiar
                  </Link>
                </>
              ) : null}
            </p>

            <OrdenSelect valorActual={orden} />
          </div>
        </div>

        <GrillaProductos
          productos={ordenados.map((p) => p.producto)}
          ofertas={ofertas}
          vacio={
            q
              ? "No encontramos nada con esa búsqueda. ¿Probás con otra palabra?"
              : "Todavía no hay productos en esta categoría."
          }
        />
      </div>
    </>
  );
}
