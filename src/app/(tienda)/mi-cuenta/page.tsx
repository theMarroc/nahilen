import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, Package } from "lucide-react";

import { salir } from "@/actions/auth";
import { GestorDirecciones } from "@/components/cuenta/gestor-direcciones";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { Boton, estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { exigirSesion, getPerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PEDIDO, type Address, type Order, type OrderStatus } from "@/lib/types";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default async function MiCuenta() {
  const usuario = await exigirSesion();
  const perfil = await getPerfil();
  const supabase = await createClient();

  const [{ data: pedidos }, { data: direcciones }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, code, access_token, status, total, created_at, delivery_type")
      .eq("user_id", usuario.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", usuario.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const nombre = perfil?.full_name || usuario.email?.split("@")[0] || "Hola";

  return (
    <>
      <CabeceraPagina titulo="Hola," tituloCursiva={nombre} />

      <div className="contenedor grid gap-10 py-10 lg:grid-cols-[1fr_22rem] lg:gap-14 lg:py-14">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="font-display text-2xl text-marron">Mis pedidos</h2>
            <span className="linea-decorativa mt-3" />

            {!pedidos || pedidos.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-marca border border-dashed border-arena/50 bg-crema/60 px-6 py-12 text-center">
                <Package className="h-10 w-10 text-arena/60" strokeWidth={1.1} />
                <p className="text-sm text-arena">Todavía no hiciste ningún pedido.</p>
                <Link href="/tienda" className={estilosBoton("secundario", "sm")}>
                  Ver la tienda
                </Link>
              </div>
            ) : (
              <ul className="mt-6 flex flex-col gap-3">
                {(pedidos as Pick<
                  Order,
                  "id" | "code" | "access_token" | "status" | "total" | "created_at" | "delivery_type"
                >[]).map((pedido) => {
                  const estado = ESTADOS_PEDIDO[pedido.status as OrderStatus];
                  return (
                    <li
                      key={pedido.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-marca border border-arena/30 bg-white p-4 shadow-suave"
                    >
                      <div>
                        <p className="font-mono text-sm font-semibold tracking-wider text-marron">
                          {pedido.code}
                        </p>
                        <p className="mt-0.5 text-xs text-arena">
                          {formatFecha(pedido.created_at)} ·{" "}
                          {pedido.delivery_type === "delivery" ? "Envío" : "Retiro"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <Insignia className={estado.clase}>{estado.label}</Insignia>
                        <p className="font-display text-lg text-carbon">
                          {formatARS(Number(pedido.total))}
                        </p>
                        <Link
                          href={`/pedido/${pedido.code}?t=${pedido.access_token}`}
                          className={estilosBoton("fantasma", "sm")}
                        >
                          Ver
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl text-marron">Mis direcciones</h2>
            <span className="linea-decorativa mt-3" />
            <p className="mt-4 text-sm leading-relaxed text-carbon/70">
              Guardá acá dónde querés recibir los pedidos. Cuando compres, las vas a poder
              elegir sin volver a escribirlas.
            </p>

            <div className="mt-6">
              <GestorDirecciones direcciones={(direcciones ?? []) as Address[]} />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-marca border border-arena/30 bg-white p-6 shadow-suave">
          <h2 className="font-display text-lg text-marron">Tus datos</h2>
          <span className="linea-decorativa mt-3" />

          <dl className="mt-5 flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-arena">
                Nombre
              </dt>
              <dd className="text-carbon/80">{perfil?.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-arena">
                Correo
              </dt>
              <dd className="break-all text-carbon/80">{usuario.email}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-arena">
                WhatsApp
              </dt>
              <dd className="text-carbon/80">{perfil?.phone || "—"}</dd>
            </div>
          </dl>

          {perfil?.is_admin ? (
            <Link
              href="/admin"
              className={estilosBoton("oscuro", "sm", "mt-6 w-full")}
            >
              Ir al panel
            </Link>
          ) : null}

          <form action={salir} className="mt-3">
            <Boton variante="secundario" tamano="sm" className="w-full" type="submit">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Boton>
          </form>
        </aside>
      </div>
    </>
  );
}
