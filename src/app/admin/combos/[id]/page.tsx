import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Trash2 } from "lucide-react";

import { borrarCombo, guardarCombo } from "@/actions/admin/combos";
import { EditorItemsCombo } from "@/components/admin/editor-items-combo";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { getCombos, getProductos } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar combo",
  robots: { index: false, follow: false },
};

export default async function EditorCombo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const [{ id }, { nuevo }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";

  const [combos, productos] = await Promise.all([
    getCombos(true),
    getProductos({ incluirInactivos: true }),
  ]);

  const combo = esNuevo ? null : combos.find((c) => c.id === id);
  if (!esNuevo && !combo) notFound();

  if (productos.length === 0) {
    return (
      <>
        <TituloAdmin
          titulo="Nuevo combo"
          volverA={{ href: "/admin/combos", texto: "Volver a combos" }}
        />
        <SinDatos mensaje="Para armar un combo primero tenés que cargar productos.">
          <Link href="/admin/productos/nuevo" className={estilosBoton("primario", "sm")}>
            Cargar un producto
          </Link>
        </SinDatos>
      </>
    );
  }

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo combo" : (combo?.name ?? "Combo")}
        volverA={{ href: "/admin/combos", texto: "Volver a combos" }}
      >
        {combo ? (
          <Link
            href={`/combos/${combo.slug}`}
            target="_blank"
            className={estilosBoton("secundario", "sm")}
          >
            <ExternalLink className="h-4 w-4" />
            Ver en la tienda
          </Link>
        ) : null}
      </TituloAdmin>

      {nuevo === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-oliva/40 bg-oliva/10 px-4 py-3 text-sm text-oliva">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Combo creado.
        </p>
      ) : null}

      <FormularioAdmin
        accion={guardarCombo}
        textoBoton={esNuevo ? "Crear combo" : "Guardar cambios"}
        className="flex flex-col gap-6"
      >
        {combo ? <input type="hidden" name="id" value={combo.id} /> : null}

        <PanelAdmin titulo="Lo básico">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Nombre" requerido className="sm:col-span-4">
              <Campo
                name="name"
                required
                defaultValue={combo?.name}
                placeholder="Combo desayuno"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Precio del combo"
              requerido
              className="sm:col-span-2"
            >
              <Campo
                name="price"
                type="number"
                min={0}
                step={1}
                required
                inputMode="numeric"
                defaultValue={combo ? String(combo.price) : ""}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Descripción" className="sm:col-span-6">
              <AreaTexto
                name="description"
                rows={3}
                maxLength={400}
                defaultValue={combo?.description ?? ""}
                placeholder="Un budín de limón + una mermelada de frutilla."
              />
            </CampoConEtiqueta>
          </div>
        </PanelAdmin>

        <PanelAdmin titulo="Qué incluye" texto="Elegí los productos y las cantidades.">
          <EditorItemsCombo
            productos={productos.map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
            }))}
            iniciales={(combo?.items ?? []).map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
            }))}
          />
        </PanelAdmin>

        <PanelAdmin titulo="Foto y visibilidad">
          <div className="grid gap-5 sm:grid-cols-2">
            <SubidorImagen
              nombre="image_url"
              carpeta="combos"
              etiqueta="Foto del combo"
              valorInicial={combo?.image_url ?? ""}
            />

            <div className="flex flex-col gap-4">
              <CampoConEtiqueta etiqueta="Orden" ayuda="Menor número, primero">
                <Campo
                  name="sort_order"
                  type="number"
                  step={1}
                  defaultValue={String(combo?.sort_order ?? combos.length + 1)}
                />
              </CampoConEtiqueta>

              <label className="flex items-center gap-2.5 text-sm text-carbon/80">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={combo?.is_active ?? true}
                  className="h-4 w-4 accent-terracota"
                />
                Visible en la tienda
              </label>
            </div>
          </div>
        </PanelAdmin>
      </FormularioAdmin>

      {combo ? (
        <PanelAdmin
          titulo="Borrar el combo"
          texto="Los productos que lo componen no se borran."
          className="mt-10 border-terracota/30"
        >
          <FormularioConfirmado
            accion={borrarCombo}
            mensaje={`¿Borrar el combo "${combo.name}"? Los productos que incluye no se borran.`}
          >
            <input type="hidden" name="id" value={combo.id} />
            <button type="submit" className={estilosBoton("peligro", "sm")}>
              <Trash2 className="h-4 w-4" />
              Borrar definitivamente
            </button>
          </FormularioConfirmado>
        </PanelAdmin>
      ) : null}
    </>
  );
}
