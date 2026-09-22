import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Copy, Pencil, Plus } from "lucide-react";

import { alternarDestacado, alternarProducto, duplicarProducto } from "@/actions/admin/productos";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getCategorias, getOfertas, getProductos } from "@/lib/db";
import { calcularPrecio, etiquetaOferta } from "@/lib/pricing";
import { formatARS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Productos",
  robots: { index: false, follow: false },
};

export default async function ProductosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [productos, categorias, ofertas] = await Promise.all([
    getProductos({ incluirInactivos: true, categoria }),
    getCategorias(true),
    getOfertas(true),
  ]);

  return (
    <>
      <TituloAdmin
        titulo="Productos"
        texto="Tocá un producto para editarlo. El interruptor lo publica o lo esconde de la tienda sin borrarlo."
      >
        <Link href="/admin/productos/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </TituloAdmin>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/admin/productos"
          className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
            !categoria
              ? "border-carbon bg-carbon text-crema"
              : "border-arena/45 text-carbon/70 hover:border-carbon"
          }`}
        >
          Todos
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/productos?categoria=${cat.slug}`}
            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
              categoria === cat.slug
                ? "border-carbon bg-carbon text-crema"
                : "border-arena/45 text-carbon/70 hover:border-carbon"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <PanelAdmin className="p-0! sm:p-0!">
        {productos.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no hay productos cargados.">
              <Link
                href="/admin/productos/nuevo"
                className={estilosBoton("primario", "sm")}
              >
                Cargar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-arena/20">
            {productos.map((producto) => {
              const precio = calcularPrecio(producto, ofertas);
              const imagen = producto.images[0]?.url;
              const agotado = producto.track_stock && producto.stock <= 0;

              return (
                <li
                  key={producto.id}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-crema/50"
                >
                  <Link
                    href={`/admin/productos/${producto.id}`}
                    className="relative h-16 w-14 shrink-0 overflow-hidden rounded-marca bg-beige/40"
                  >
                    {imagen ? (
                      <Image
                        src={imagen}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderImagen texto={producto.name} />
                    )}
                  </Link>

                  <div className="min-w-40 flex-1">
                    <Link
                      href={`/admin/productos/${producto.id}`}
                      className="font-display text-lg leading-snug text-marron transition-colors hover:text-terracota"
                    >
                      {producto.name}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-arena">
                      {producto.category?.name ?? "Sin categoría"}
                      {producto.unit ? <>· {producto.unit}</> : null}
                      {producto.track_stock ? (
                        <>· {producto.stock} en stock</>
                      ) : null}
                      {agotado ? (
                        <Insignia className="bg-terracota/15 text-terracota-oscuro">
                          Sin stock
                        </Insignia>
                      ) : null}
                      {precio.oferta ? (
                        <Insignia className="bg-terracota text-white">
                          {etiquetaOferta(precio.oferta, precio)}
                        </Insignia>
                      ) : null}
                    </p>
                  </div>

                  <div className="text-right">
                    {precio.oferta ? (
                      <p className="text-xs text-arena line-through">
                        {formatARS(precio.lista)}
                      </p>
                    ) : null}
                    <p className="font-display text-lg text-carbon">
                      {formatARS(precio.final)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-arena">
                        Visible
                      </span>
                      <Interruptor
                        accion={alternarProducto}
                        campos={{ id: producto.id }}
                        activo={producto.is_active}
                        etiqueta={`Mostrar ${producto.name} en la tienda`}
                      />
                    </label>

                    <label className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-arena">
                        Destacado
                      </span>
                      <Interruptor
                        accion={alternarDestacado}
                        campos={{ id: producto.id }}
                        activo={producto.is_featured}
                        etiqueta={`Destacar ${producto.name} en la portada`}
                      />
                    </label>

                    <div className="flex gap-1">
                      <Link
                        href={`/admin/productos/${producto.id}`}
                        title="Editar"
                        className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/50 hover:text-marron"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <form action={duplicarProducto}>
                        <input type="hidden" name="id" value={producto.id} />
                        <button
                          type="submit"
                          title="Duplicar"
                          className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/50 hover:text-marron"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelAdmin>
    </>
  );
}
