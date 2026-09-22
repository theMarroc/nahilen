import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Home, Store } from "lucide-react";

import { DatosTransferencia } from "@/components/checkout/datos-transferencia";
import { SubirComprobante } from "@/components/checkout/subir-comprobante";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp, Ornamento } from "@/components/ui/marca";
import { getAjustes } from "@/lib/db";
import { ajuste, ajusteCrudo, linkWhatsapp } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/server";
import { ESTADOS_PEDIDO, type Order, type OrderItem } from "@/lib/types";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

export default async function PaginaPedido({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [{ code }, { t }] = await Promise.all([params, searchParams]);

  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) notFound();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("code", code)
    .maybeSingle();

  const pedido = data as (Order & { items: OrderItem[] }) | null;

  // El link del pedido incluye un token secreto: sin eso, no se muestra nada.
  if (!pedido || !t || pedido.access_token !== t) notFound();

  const ajustes = await getAjustes();
  const estado = ESTADOS_PEDIDO[pedido.status];
  const esperandoComprobante =
    pedido.payment_method === "transfer" && pedido.status === "pendiente_pago";

  const mensajeWhatsapp = [
    `¡Hola! Te escribo por el pedido ${pedido.code}`,
    `Total: ${formatARS(Number(pedido.total))}`,
    pedido.payment_method === "transfer"
      ? "Te envío el comprobante de la transferencia."
      : "Pagué con Mercado Pago.",
  ].join("\n");

  return (
    <div className="contenedor max-w-3xl py-12 lg:py-16">
      <div className="flex flex-col items-center text-center">
        {pedido.status === "pagado" || pedido.status === "entregado" ? (
          <CheckCircle2 className="h-12 w-12 text-oliva" strokeWidth={1.3} />
        ) : (
          <Clock className="h-12 w-12 text-mostaza-oscuro" strokeWidth={1.3} />
        )}

        <h1 className="titulo-seccion mt-4 text-marron">
          ¡Gracias por tu <span className="italic text-terracota">pedido</span>!
        </h1>

        <Ornamento className="mt-5" />

        <p className="mt-5 max-w-lg text-sm leading-relaxed text-carbon/70">
          Guardá este link: desde acá podés ver el estado de tu pedido y subir el
          comprobante.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-marca border border-arena/40 bg-white px-4 py-2 font-mono text-sm font-semibold tracking-wider text-marron">
            {pedido.code}
          </span>
          <Insignia className={estado.clase}>{estado.label}</Insignia>
        </div>
      </div>

      {esperandoComprobante ? (
        <section className="mt-10">
          <DatosTransferencia
            titular={ajusteCrudo(ajustes, "transferencia_titular")}
            alias={ajusteCrudo(ajustes, "transferencia_alias")}
            cbu={ajusteCrudo(ajustes, "transferencia_cbu")}
            banco={ajusteCrudo(ajustes, "transferencia_banco")}
            monto={Number(pedido.total)}
            codigo={pedido.code}
          />
        </section>
      ) : null}

      {pedido.payment_method === "transfer" && pedido.status !== "entregado" ? (
        <section className="mt-6">
          <SubirComprobante
            codigo={pedido.code}
            token={pedido.access_token}
            yaSubido={Boolean(pedido.receipt_path)}
          />
        </section>
      ) : null}

      <section className="mt-6 rounded-marca border border-arena/30 bg-white p-6 shadow-suave">
        <h2 className="font-display text-xl text-marron">Detalle</h2>
        <span className="linea-decorativa mt-3" />

        <ul className="mt-5 divide-y divide-arena/20">
          {(pedido.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-carbon/80">
                <span className="font-semibold text-carbon">{item.quantity}×</span>{" "}
                {item.name}
              </span>
              <span className="shrink-0 font-semibold text-carbon">
                {formatARS(Number(item.subtotal))}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 flex flex-col gap-2 border-t border-arena/25 pt-4 text-sm">
          {Number(pedido.discount_total) > 0 ? (
            <div className="flex justify-between text-oliva">
              <dt>Descuentos</dt>
              <dd className="font-semibold">
                -{formatARS(Number(pedido.discount_total))}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-carbon/70">Envío</dt>
            <dd className="font-semibold">
              {Number(pedido.shipping_total) > 0
                ? formatARS(Number(pedido.shipping_total))
                : pedido.delivery_type === "pickup"
                  ? "Retiro"
                  : "Sin cargo"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-arena/25 pt-3">
            <dt className="text-sm uppercase tracking-[0.1em] text-arena">Total</dt>
            <dd className="font-display text-2xl text-marron">
              {formatARS(Number(pedido.total))}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 border-t border-arena/25 pt-5 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-marron">
              {pedido.delivery_type === "delivery" ? (
                <span className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" /> Entrega
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" /> Retiro
                </span>
              )}
            </p>
            <p className="mt-1.5 leading-relaxed text-carbon/70">
              {pedido.delivery_type === "delivery" ? (
                <>
                  {pedido.address_street} {pedido.address_number}
                  {pedido.address_apartment ? `, ${pedido.address_apartment}` : ""}
                  <br />
                  {pedido.address_city}
                  {pedido.address_zone ? ` — ${pedido.address_zone}` : ""}
                </>
              ) : (
                ajuste(ajustes, "retiro_direccion") || "Coordinamos por WhatsApp"
              )}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-marron">
              Pedido realizado
            </p>
            <p className="mt-1.5 text-carbon/70">{formatFecha(pedido.created_at)}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-marron">
              A nombre de
            </p>
            <p className="mt-1.5 text-carbon/70">
              {pedido.customer_name} — {pedido.customer_phone}
            </p>
          </div>
        </div>

        {pedido.notes ? (
          <p className="mt-5 rounded-marca bg-crema px-4 py-3 text-sm leading-relaxed text-carbon/75">
            <span className="font-semibold text-marron">Tu nota: </span>
            {pedido.notes}
          </p>
        ) : null}
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={linkWhatsapp(ajuste(ajustes, "whatsapp_numero"), mensajeWhatsapp)}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("primario", "md")}
        >
          <IconoWhatsapp className="h-4 w-4" />
          Escribirnos por WhatsApp
        </a>
        <Link href="/tienda" className={estilosBoton("secundario", "md")}>
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
