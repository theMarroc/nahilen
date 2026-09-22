import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { alternarCombo } from "@/actions/admin/combos";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getCombos } from "@/lib/db";
import { formatARS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Combos",
  robots: { index: false, follow: false },
};

export default async function CombosAdmin() {
  const combos = await getCombos(true);

  return (
    <>
      <TituloAdmin
        titulo="Combos"
        texto="Agrupá varios productos con un precio especial. Se muestran en la portada y en la página de combos."
      >
        <Link href="/admin/combos/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo combo
        </Link>
      </TituloAdmin>

      <PanelAdmin className="p-0! sm:p-0!">
        {combos.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no armaste ningún combo.">
              <Link
                href="/admin/combos/nuevo"
                className={estilosBoton("primario", "sm")}
              >
                Armar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-arena/20">
            {combos.map((combo) => {
              const cantidad =
                combo.items?.reduce((acumulado, i) => acumulado + i.quantity, 0) ?? 0;

              return (
                <li
                  key={combo.id}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-crema/50"
                >
                  <Link
                    href={`/admin/combos/${combo.id}`}
                    className="relative h-16 w-14 shrink-0 overflow-hidden rounded-marca bg-beige/40"
                  >
                    {combo.image_url ? (
                      <Image
                        src={combo.image_url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderImagen texto={combo.name} />
                    )}
                  </Link>

                  <div className="min-w-40 flex-1">
                    <Link
                      href={`/admin/combos/${combo.id}`}
                      className="font-display text-lg leading-snug text-marron transition-colors hover:text-terracota"
                    >
                      {combo.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-arena">
                      {cantidad} {cantidad === 1 ? "producto" : "productos"} · orden{" "}
                      {combo.sort_order}
                    </p>
                  </div>

                  <p className="font-display text-lg text-carbon">
                    {formatARS(Number(combo.price))}
                  </p>

                  <Interruptor
                    accion={alternarCombo}
                    campos={{ id: combo.id }}
                    activo={combo.is_active}
                    etiqueta={`Mostrar ${combo.name}`}
                  />

                  <Link
                    href={`/admin/combos/${combo.id}`}
                    title="Editar"
                    className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/50 hover:text-marron"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PanelAdmin>
    </>
  );
}
