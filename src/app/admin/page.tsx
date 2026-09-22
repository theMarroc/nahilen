import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { getAjustes } from "@/lib/db";
import { ajusteCrudo, esVerdadero } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PEDIDO, type Order, type OrderStatus } from "@/lib/types";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function ResumenAdmin() {
  const supabase = await createClient();

  const [
    pedidosRecientes,
    porRevisar,
    totalProductos,
    sinStock,
    ofertasActivas,
    ajustes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, code, customer_name, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pendiente_pago", "comprobante_enviado"]),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name", { count: "exact" })
      .eq("track_stock", true)
      .lte("stock", 0),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    getAjustes(),
  ]);

  const pedidos = (pedidosRecientes.data ?? []) as Pick<
    Order,
    "id" | "code" | "customer_name" | "status" | "total" | "created_at"
  >[];

  const pendientes = porRevisar.count ?? 0;

  const faltaConfigurar = [
    !ajusteCrudo(ajustes, "whatsapp_numero") && {
      texto: "Todavía no cargaste el número de WhatsApp.",
      href: "/admin/ajustes",
    },
    esVerdadero(ajustes.pago_transferencia_activo ?? "true") &&
      !ajusteCrudo(ajustes, "transferencia_alias") &&
      !ajusteCrudo(ajustes, "transferencia_cbu") && {
        texto: "Falta el alias o CBU para cobrar por transferencia.",
        href: "/admin/ajustes",
      },
    (totalProductos.count ?? 0) === 0 && {
      texto: "No hay productos cargados en la tienda.",
      href: "/admin/productos",
    },
  ].filter(Boolean) as { texto: string; href: string }[];

  const tarjetas = [
    {
      titulo: "Pedidos por revisar",
      valor: String(pendientes),
      href: "/admin/pedidos",
      Icono: ShoppingBag,
      destacar: pendientes > 0,
    },
    {
      titulo: "Productos publicados",
      valor: String(totalProductos.count ?? 0),
      href: "/admin/productos",
      Icono: Package,
      destacar: false,
    },
    {
      titulo: "Ofertas activas",
      valor: String(ofertasActivas.count ?? 0),
      href: "/admin/ofertas",
      Icono: Percent,
      destacar: false,
    },
    {
      titulo: "Sin stock",
      valor: String(sinStock.count ?? 0),
      href: "/admin/productos",
      Icono: AlertTriangle,
      destacar: (sinStock.count ?? 0) > 0,
    },
  ];

  return (
    <>
      <TituloAdmin
        titulo="Tu panel"
        texto="Desde acá administrás todo lo que se ve en la página."
      >
        <Link href="/admin/productos/nuevo" className={estilosBoton("primario", "sm")}>
          Nuevo producto
        </Link>
        <Link href="/admin/precios" className={estilosBoton("secundario", "sm")}>
          <TrendingUp className="h-4 w-4" />
          Aumentar precios
        </Link>
      </TituloAdmin>

      {faltaConfigurar.length > 0 ? (
        <div className="mb-8 rounded-marca border border-mostaza/50 bg-mostaza/15 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-marron">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.6} />
            Para terminar de dejarlo listo
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {faltaConfigurar.map((item) => (
              <li key={item.texto}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-sm text-carbon/80 transition-colors hover:text-terracota"
                >
                  {item.texto}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map(({ titulo, valor, href, Icono, destacar }) => (
          <Link
            key={titulo}
            href={href}
            className={`rounded-marca border bg-white p-4 shadow-suave transition-colors hover:border-terracota/60 ${
              destacar ? "border-terracota/50" : "border-arena/30"
            }`}
          >
            <Icono
              className={`h-5 w-5 ${destacar ? "text-terracota" : "text-arena"}`}
              strokeWidth={1.5}
            />
            <p className="mt-3 font-display text-3xl text-marron">{valor}</p>
            <p className="mt-0.5 text-xs leading-snug text-carbon/65">{titulo}</p>
          </Link>
        ))}
      </div>

      <PanelAdmin titulo="Últimos pedidos">
        {pedidos.length === 0 ? (
          <SinDatos mensaje="Todavía no entró ningún pedido." />
        ) : (
          <ul className="divide-y divide-arena/20">
            {pedidos.map((pedido) => {
              const estado = ESTADOS_PEDIDO[pedido.status as OrderStatus];
              return (
                <li key={pedido.id}>
                  <Link
                    href={`/admin/pedidos/${pedido.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-crema/60"
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold tracking-wider text-marron">
                        {pedido.code}
                      </p>
                      <p className="mt-0.5 text-xs text-arena">
                        {pedido.customer_name} · {formatFecha(pedido.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Insignia className={estado.clase}>{estado.label}</Insignia>
                      <span className="font-display text-lg text-carbon">
                        {formatARS(Number(pedido.total))}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/admin/pedidos"
          className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-terracota hover:underline"
        >
          Ver todos los pedidos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </PanelAdmin>
    </>
  );
}
