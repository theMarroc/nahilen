import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, X } from "lucide-react";

import {
  alternarCategoria,
  borrarCategoria,
  guardarCategoria,
} from "@/actions/admin/categorias";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getCategorias, getProductos } from "@/lib/db";

export const metadata: Metadata = {
  title: "Categorías",
  robots: { index: false, follow: false },
};

export default async function CategoriasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const { editar } = await searchParams;

  const [categorias, productos] = await Promise.all([
    getCategorias(true),
    getProductos({ incluirInactivos: true }),
  ]);

  const enEdicion = categorias.find((c) => c.id === editar) ?? null;
  const contar = (id: string) =>
    productos.filter((p) => p.category_id === id).length;

  const avisoProductos = (cantidad: number) =>
    cantidad === 0
      ? ""
      : cantidad === 1
        ? " Su producto no se borra: queda sin categoría."
        : ` Sus ${cantidad} productos no se borran: quedan sin categoría.`;

  return (
    <>
      <TituloAdmin
        titulo="Categorías"
        texto="Son los grupos en los que se ordena la tienda: mermeladas, budines, para regalar. Las tres primeras se muestran en la portada."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <PanelAdmin className="p-0! sm:p-0!">
          {categorias.length === 0 ? (
            <div className="p-6">
              <SinDatos mensaje="Todavía no hay categorías." />
            </div>
          ) : (
            <ul className="divide-y divide-arena/20">
              {categorias.map((categoria) => (
                <li
                  key={categoria.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-marca bg-beige/40">
                    {categoria.image_url ? (
                      <Image
                        src={categoria.image_url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderImagen texto={categoria.name} />
                    )}
                  </div>

                  <div className="min-w-32 flex-1">
                    <p className="font-display text-lg text-marron">{categoria.name}</p>
                    <p className="text-xs text-arena">
                      {contar(categoria.id)}{" "}
                      {contar(categoria.id) === 1 ? "producto" : "productos"} · orden{" "}
                      {categoria.sort_order}
                    </p>
                  </div>

                  <Interruptor
                    accion={alternarCategoria}
                    campos={{ id: categoria.id }}
                    activo={categoria.is_active}
                    etiqueta={`Mostrar ${categoria.name}`}
                  />

                  <div className="flex gap-1">
                    <Link
                      href={`/admin/categorias?editar=${categoria.id}`}
                      title="Editar"
                      className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/50 hover:text-marron"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <FormularioConfirmado
                      accion={borrarCategoria}
                      mensaje={`¿Borrar la categoría "${categoria.name}"?${avisoProductos(contar(categoria.id))}`}
                    >
                      <input type="hidden" name="id" value={categoria.id} />
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

        <div>
          <PanelAdmin
            titulo={enEdicion ? "Editar categoría" : "Nueva categoría"}
            className="lg:sticky lg:top-8"
          >
            {enEdicion ? (
              <Link
                href="/admin/categorias"
                className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-arena hover:text-marron"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar la edición
              </Link>
            ) : null}

            <FormularioAdmin
              accion={guardarCategoria}
              textoBoton={enEdicion ? "Guardar" : "Crear categoría"}
              className="flex flex-col gap-4"
              key={enEdicion?.id ?? "nueva"}
            >
              {enEdicion ? (
                <input type="hidden" name="id" value={enEdicion.id} />
              ) : null}

              <CampoConEtiqueta etiqueta="Nombre" requerido>
                <Campo
                  name="name"
                  required
                  defaultValue={enEdicion?.name ?? ""}
                  placeholder="Mermeladas"
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Descripción"
                ayuda="Se ve debajo del nombre en la portada"
              >
                <AreaTexto
                  name="description"
                  rows={2}
                  maxLength={200}
                  defaultValue={enEdicion?.description ?? ""}
                />
              </CampoConEtiqueta>

              <SubidorImagen
                nombre="image_url"
                carpeta="categorias"
                etiqueta="Foto de la categoría"
                ayuda="Se recorta vertical, como en la portada"
                valorInicial={enEdicion?.image_url ?? ""}
                key={`img-${enEdicion?.id ?? "nueva"}`}
              />

              <CampoConEtiqueta etiqueta="Orden" ayuda="Menor número, primero">
                <Campo
                  name="sort_order"
                  type="number"
                  step={1}
                  defaultValue={String(enEdicion?.sort_order ?? categorias.length + 1)}
                />
              </CampoConEtiqueta>

              <label className="flex items-center gap-2.5 text-sm text-carbon/80">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={enEdicion?.is_active ?? true}
                  className="h-4 w-4 accent-terracota"
                />
                Visible en la tienda
              </label>
            </FormularioAdmin>
          </PanelAdmin>

          <p className="mt-4 px-1 text-xs leading-relaxed text-arena">
            Si borrás una categoría, sus productos no se borran: quedan sin categoría y
            los podés reasignar desde{" "}
            <Link href="/admin/productos" className="underline">
              Productos
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
