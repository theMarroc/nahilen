import type { Metadata } from "next";
import { Undo2 } from "lucide-react";

import { cambiarPrecioSuelto, deshacerAumento } from "@/actions/admin/precios";
import { FormularioAumento } from "@/components/admin/formulario-aumento";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Campo, Insignia } from "@/components/ui/campos";
import { getCategorias, getProductos } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Aumentar precios",
  robots: { index: false, follow: false },
};

type Cambio = {
  id: string;
  batch_id: string;
  product_name: string | null;
  old_price: number | null;
  new_price: number | null;
  reason: string | null;
  reverted_at: string | null;
  created_at: string;
};

export default async function PreciosAdmin() {
  const supabase = await createClient();

  const [productos, categorias, { data: cambios }] = await Promise.all([
    getProductos({ incluirInactivos: true }),
    getCategorias(true),
    supabase
      .from("price_changes")
      .select("id, batch_id, product_name, old_price, new_price, reason, reverted_at, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // Agrupamos el historial por tanda para poder deshacer un aumento completo.
  const lotes = new Map<
    string,
    { fecha: string; motivo: string; cantidad: number; revertido: boolean; ejemplos: Cambio[] }
  >();

  for (const cambio of (cambios ?? []) as Cambio[]) {
    const lote = lotes.get(cambio.batch_id);
    if (lote) {
      lote.cantidad += 1;
      if (lote.ejemplos.length < 3) lote.ejemplos.push(cambio);
    } else {
      lotes.set(cambio.batch_id, {
        fecha: cambio.created_at,
        motivo: cambio.reason ?? "Cambio de precio",
        cantidad: 1,
        revertido: Boolean(cambio.reverted_at),
        ejemplos: [cambio],
      });
    }
  }

  return (
    <>
      <TituloAdmin
        titulo="Aumentar precios"
        texto="Subí (o bajá) todos los precios de una vez. Primero mirás la vista previa y después lo aplicás."
      />

      <div className="flex flex-col gap-6">
        <PanelAdmin titulo="Aumento en lote">
          <FormularioAumento
            productos={productos.map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              category_id: p.category_id,
            }))}
            categorias={categorias.map((c) => ({ id: c.id, name: c.name }))}
          />
        </PanelAdmin>

        <PanelAdmin className="p-0! sm:p-0!">
          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
            <h2 className="font-display text-xl text-marron">Cambiar un precio suelto</h2>
            <p className="mt-1.5 text-sm text-carbon/65">
              Escribí el precio nuevo y apretá Enter o el botón.
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="px-5 pb-6">
              <SinDatos mensaje="No hay productos cargados." />
            </div>
          ) : (
            <ul className="divide-y divide-arena/20 border-t border-arena/20">
              {productos.map((producto) => (
                <li
                  key={producto.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6"
                >
                  <div className="min-w-40 flex-1">
                    <p className="text-sm text-carbon/85">{producto.name}</p>
                    <p className="text-xs text-arena">
                      {producto.category?.name ?? "Sin categoría"} · ahora{" "}
                      {formatARS(Number(producto.price))}
                    </p>
                  </div>

                  <form action={cambiarPrecioSuelto} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={producto.id} />
                    <Campo
                      name="precio"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      defaultValue={String(producto.price)}
                      className="w-28"
                      aria-label={`Precio de ${producto.name}`}
                    />
                    <button type="submit" className={estilosBoton("secundario", "sm")}>
                      Guardar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </PanelAdmin>

        <PanelAdmin
          titulo="Historial"
          texto="Cada aumento en lote se puede deshacer y los precios vuelven a como estaban."
        >
          {lotes.size === 0 ? (
            <SinDatos mensaje="Todavía no hiciste cambios de precios." />
          ) : (
            <ul className="divide-y divide-arena/20">
              {[...lotes.entries()].map(([loteId, lote]) => (
                <li
                  key={loteId}
                  className="flex flex-wrap items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-48 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-marron">
                      {lote.motivo}
                      {lote.revertido ? (
                        <Insignia className="bg-carbon/10 text-carbon/60">
                          Deshecho
                        </Insignia>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-arena">
                      {formatFecha(lote.fecha)} · {lote.cantidad}{" "}
                      {lote.cantidad === 1 ? "producto" : "productos"}
                    </p>
                    <p className="mt-1 text-xs text-carbon/60">
                      {lote.ejemplos
                        .map(
                          (ejemplo) =>
                            `${ejemplo.product_name}: ${formatARS(
                              Number(ejemplo.old_price),
                            )} → ${formatARS(Number(ejemplo.new_price))}`,
                        )
                        .join(" · ")}
                      {lote.cantidad > lote.ejemplos.length ? " ..." : ""}
                    </p>
                  </div>

                  {!lote.revertido && lote.cantidad > 0 ? (
                    <form action={deshacerAumento}>
                      <input type="hidden" name="batch_id" value={loteId} />
                      <button type="submit" className={estilosBoton("peligro", "sm")}>
                        <Undo2 className="h-4 w-4" />
                        Deshacer
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </PanelAdmin>
      </div>
    </>
  );
}
