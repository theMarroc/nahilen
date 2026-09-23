import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";

import { BorrarPedido } from "@/components/admin/borrar-pedido";
import { EstadoPedido } from "@/components/admin/estado-pedido";
import { FilaDato, PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes } from "@/lib/db";
import { ajuste, linkWhatsapp } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detalle del pedido",
  robots: { index: false, follow: false },
};

export default async function DetallePedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .maybeSingle();

  const pedido = data as (Order & { items: OrderItem[] }) | null;
  if (!pedido) notFound();

  const ajustes = await getAjustes();

  // El bucket de comprobantes es privado: generamos un link temporal.
  let urlComprobante: string | null = null;
  if (pedido.receipt_path && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data: firmado } = await admin.storage
      .from("comprobantes")
      .createSignedUrl(pedido.receipt_path, 60 * 60);
    urlComprobante = firmado?.signedUrl ?? null;
  }

  const mensaje = `¡Hola ${pedido.customer_name.split(" ")[0]}! Te escribo por tu pedido ${pedido.code} de ${ajuste(ajustes, "marca_nombre")}.`;

  return (
    <>
      <TituloAdmin
        titulo={pedido.code}
        volverA={{ href: "/admin/pedidos", texto: "Volver a pedidos" }}
      >
        <a
          href={linkWhatsapp(pedido.customer_phone, mensaje)}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("primario", "sm")}
        >
          <IconoWhatsapp className="h-4 w-4" />
          Escribirle
        </a>
      </TituloAdmin>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <PanelAdmin titulo="Qué pidió">
            <ul className="divide-y divide-arena/20">
              {(pedido.items ?? []).map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
                  <span className="text-carbon/80">
                    <span className="font-semibold text-carbon">{item.quantity}×</span>{" "}
                    {item.name}
                    {item.kind === "combo" ? (
                      <Insignia className="ml-2 bg-mostaza/30 text-marron">Combo</Insignia>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-carbon/70">
                    {formatARS(Number(item.unit_price))} c/u ={" "}
                    <strong className="font-semibold text-carbon">
                      {formatARS(Number(item.subtotal))}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 flex flex-col gap-1.5 border-t border-arena/25 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-carbon/70">Productos</dt>
                <dd>{formatARS(Number(pedido.items_total))}</dd>
              </div>
              {Number(pedido.discount_total) > 0 ? (
                <div className="flex justify-between text-oliva">
                  <dt>Descuentos</dt>
                  <dd>-{formatARS(Number(pedido.discount_total))}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-carbon/70">Envío</dt>
                <dd>{formatARS(Number(pedido.shipping_total))}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-arena/25 pt-3">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-arena">
                  Total
                </dt>
                <dd className="font-display text-2xl text-marron">
                  {formatARS(Number(pedido.total))}
                </dd>
              </div>
            </dl>
          </PanelAdmin>

          <PanelAdmin titulo="Datos de la entrega">
            <div className="grid gap-x-8 sm:grid-cols-2">
              <FilaDato etiqueta="Cliente">{pedido.customer_name}</FilaDato>
              <FilaDato etiqueta="WhatsApp">{pedido.customer_phone}</FilaDato>
              <FilaDato etiqueta="Email">{pedido.customer_email ?? "—"}</FilaDato>
              <FilaDato etiqueta="Forma de entrega">
                {pedido.delivery_type === "delivery" ? "Envío a domicilio" : "Retira"}
              </FilaDato>

              {pedido.delivery_type === "delivery" ? (
                <>
                  <FilaDato etiqueta="Dirección">
                    {pedido.address_street} {pedido.address_number}
                    {pedido.address_apartment ? `, ${pedido.address_apartment}` : ""}
                  </FilaDato>
                  <FilaDato etiqueta="Localidad">
                    {pedido.address_city}
                    {pedido.address_zone ? ` — ${pedido.address_zone}` : ""}
                  </FilaDato>
                  <FilaDato etiqueta="Indicaciones">
                    {pedido.address_notes ?? "—"}
                  </FilaDato>
                </>
              ) : null}

              <FilaDato etiqueta="Forma de pago">
                {pedido.payment_method === "transfer"
                  ? "Transferencia bancaria"
                  : "Mercado Pago"}
              </FilaDato>
              <FilaDato etiqueta="Fecha">{formatFecha(pedido.created_at)}</FilaDato>
              {pedido.mp_payment_id ? (
                <FilaDato etiqueta="ID de pago (Mercado Pago)">
                  {pedido.mp_payment_id}
                </FilaDato>
              ) : null}
            </div>

            {pedido.notes ? (
              <p className="mt-4 rounded-marca bg-crema px-4 py-3 text-sm leading-relaxed text-carbon/80">
                <span className="font-semibold text-marron">Nota del cliente: </span>
                {pedido.notes}
              </p>
            ) : null}
          </PanelAdmin>
        </div>

        <div className="flex flex-col gap-6">
          <PanelAdmin titulo="Estado" className="h-fit">
            <EstadoPedido pedidoId={pedido.id} estadoInicial={pedido.status} />
          </PanelAdmin>

          <PanelAdmin titulo="Comprobante" className="h-fit">
            {urlComprobante ? (
              <>
                <a
                  href={urlComprobante}
                  target="_blank"
                  rel="noreferrer"
                  className={estilosBoton("secundario", "sm", "w-full")}
                >
                  <FileText className="h-4 w-4" />
                  Ver el comprobante
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <p className="mt-3 text-xs leading-relaxed text-arena">
                  El link vence en una hora por seguridad. Volvé a entrar a esta pantalla
                  para generar uno nuevo.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-carbon/65">
                {pedido.payment_method === "transfer"
                  ? "Todavía no subió el comprobante."
                  : "Este pedido se pagó con Mercado Pago, no hay comprobante para revisar."}
              </p>
            )}
          </PanelAdmin>

          <PanelAdmin titulo="Borrar" className="h-fit border-terracota/30">
            <p className="mb-4 text-sm leading-relaxed text-carbon/65">
              Conviene cancelarlo en vez de borrarlo, así queda el registro.
            </p>
            <BorrarPedido pedidoId={pedido.id} codigo={pedido.code} />
          </PanelAdmin>
        </div>
      </div>
    </>
  );
}
