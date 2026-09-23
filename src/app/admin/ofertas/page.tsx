import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2, X } from "lucide-react";

import { alternarOferta, borrarOferta } from "@/actions/admin/ofertas";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { FormularioOferta } from "@/components/admin/formulario-oferta";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { Insignia } from "@/components/ui/campos";
import { getCategorias, getOfertas, getProductos } from "@/lib/db";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ofertas",
  robots: { index: false, follow: false },
};

export default async function OfertasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;

  const [ofertas, categorias, productos] = await Promise.all([
    getOfertas(true),
    getCategorias(true),
    getProductos({ incluirInactivos: true }),
  ]);

  const enEdicion = ofertas.find((o) => o.id === editar) ?? null;

  const describir = (oferta: (typeof ofertas)[number]) => {
    const descuento =
      oferta.kind === "percent"
        ? `${oferta.value}% de descuento`
        : `${formatARS(oferta.value)} de descuento`;

    if (oferta.scope === "all") return `${descuento} en toda la tienda`;
    if (oferta.scope === "category") {
      const categoria = categorias.find((c) => c.id === oferta.category_id);
      return `${descuento} en ${categoria?.name ?? "una categoría borrada"}`;
    }
    const producto = productos.find((p) => p.id === oferta.product_id);
    return `${descuento} en ${producto?.name ?? "un producto borrado"}`;
  };

  const vigencia = (oferta: (typeof ofertas)[number]) => {
    if (!oferta.starts_at && !oferta.ends_at) return "Sin fecha de fin";
    if (oferta.starts_at && oferta.ends_at) {
      return `Del ${formatFecha(oferta.starts_at)} al ${formatFecha(oferta.ends_at)}`;
    }
    if (oferta.ends_at) return `Hasta ${formatFecha(oferta.ends_at)}`;
    return `Desde ${formatFecha(oferta.starts_at!)}`;
  };

  const terminada = (oferta: (typeof ofertas)[number]) =>
    Boolean(oferta.ends_at && new Date(oferta.ends_at) < new Date());

  return (
    <>
      <TituloAdmin
        titulo="Ofertas"
        texto="Los descuentos se aplican solos en la tienda. Si hay más de uno para el mismo producto, se usa el que más le conviene al cliente."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <PanelAdmin className="p-0! sm:p-0!">
          {ofertas.length === 0 ? (
            <div className="p-6">
              <SinDatos mensaje="Todavía no creaste ninguna oferta." />
            </div>
          ) : (
            <ul className="divide-y divide-arena/20">
              {ofertas.map((oferta) => (
                <li
                  key={oferta.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="min-w-40 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg text-marron">
                      {oferta.name}
                      {terminada(oferta) ? (
                        <Insignia className="bg-carbon/10 text-carbon/60">
                          Terminada
                        </Insignia>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-carbon/70">{describir(oferta)}</p>
                    <p className="mt-0.5 text-xs text-arena">{vigencia(oferta)}</p>
                  </div>

                  <Interruptor
                    accion={alternarOferta}
                    campos={{ id: oferta.id }}
                    activo={oferta.is_active}
                    etiqueta={`Activar ${oferta.name}`}
                  />

                  <div className="flex gap-1">
                    <Link
                      href={`/admin/ofertas?editar=${oferta.id}`}
                      title="Editar"
                      className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/50 hover:text-marron"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <FormularioConfirmado
                      accion={borrarOferta}
                      mensaje={`¿Borrar la oferta "${oferta.name}"? Si solo querés pausarla, apagala con el interruptor.`}
                    >
                      <input type="hidden" name="id" value={oferta.id} />
                      <button
                        type="submit"
                        title="Borrar"
                        className="rounded-marca p-2 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </FormularioConfirmado>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelAdmin>

        <PanelAdmin
          titulo={enEdicion ? "Editar oferta" : "Nueva oferta"}
          className="h-fit lg:sticky lg:top-8"
        >
          {enEdicion ? (
            <Link
              href="/admin/ofertas"
              className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-arena hover:text-marron"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar la edición
            </Link>
          ) : null}

          <FormularioOferta
            key={enEdicion?.id ?? "nueva"}
            oferta={enEdicion}
            categorias={categorias.map((c) => ({ id: c.id, name: c.name }))}
            productos={productos.map((p) => ({ id: p.id, name: p.name }))}
          />
        </PanelAdmin>
      </div>
    </>
  );
}
