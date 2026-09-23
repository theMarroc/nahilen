import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileCheck, Home, Store } from "lucide-react";

import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { Insignia } from "@/components/ui/campos";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PEDIDO, type Order, type OrderStatus } from "@/lib/types";
import { formatARS, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pedidos",
  robots: { index: false, follow: false },
};

const FILTROS = [
  { valor: "", texto: "Todos" },
  { valor: "por_revisar", texto: "Por revisar" },
  { valor: "pagado", texto: "Pagados" },
  { valor: "en_preparacion", texto: "En preparación" },
  { valor: "entregado", texto: "Entregados" },
  { valor: "cancelado", texto: "Cancelados" },
] as const;

type FilaPedido = Pick<
  Order,
  | "id"
  | "code"
  | "customer_name"
  | "customer_phone"
  | "status"
  | "total"
  | "created_at"
  | "delivery_type"
  | "payment_method"
  | "receipt_path"
>;

export default async function PedidosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; borrado?: string }>;
}) {
  const { estado: filtro = "", borrado } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("orders")
    .select(
      "id, code, customer_name, customer_phone, status, total, created_at, delivery_type, payment_method, receipt_path",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filtro === "por_revisar") {
    consulta = consulta.in("status", ["pendiente_pago", "comprobante_enviado"]);
  } else if (filtro) {
    consulta = consulta.eq("status", filtro);
  }

  const { data } = await consulta;
  const pedidos = (data ?? []) as FilaPedido[];

  return (
    <>
      <TituloAdmin
        titulo="Pedidos"
        texto="Acá entran todos los pedidos de la web. Tocá uno para ver el detalle, el comprobante y cambiarle el estado."
      />

      {borrado ? (
        <p className="mb-5 flex items-center gap-2 rounded-marca border border-oliva/40 bg-oliva/10 px-4 py-3 text-sm text-oliva">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Se borró el pedido {borrado}.
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map((opcion) => (
          <Link
            key={opcion.valor}
            href={opcion.valor ? `/admin/pedidos?estado=${opcion.valor}` : "/admin/pedidos"}
            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
              filtro === opcion.valor
                ? "border-carbon bg-carbon text-crema"
                : "border-arena/45 text-carbon/70 hover:border-carbon"
            }`}
          >
            {opcion.texto}
          </Link>
        ))}
      </div>

      <PanelAdmin className="p-0! sm:p-0!">
        {pedidos.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="No hay pedidos con ese filtro." />
          </div>
        ) : (
          <ul className="divide-y divide-arena/20">
            {pedidos.map((pedido) => {
              const estado = ESTADOS_PEDIDO[pedido.status as OrderStatus];
              return (
                <li key={pedido.id}>
                  <Link
                    href={`/admin/pedidos/${pedido.id}`}
                    className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-crema/50"
                  >
                    <div className="min-w-40 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-mono text-sm font-semibold tracking-wider text-marron">
                        {pedido.code}
                        {pedido.receipt_path ? (
                          <span title="Tiene comprobante">
                            <FileCheck className="h-4 w-4 text-oliva" strokeWidth={1.6} />
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-sm text-carbon/75">
                        {pedido.customer_name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-arena">
                        {pedido.delivery_type === "delivery" ? (
                          <Home className="h-3 w-3" />
                        ) : (
                          <Store className="h-3 w-3" />
                        )}
                        {pedido.delivery_type === "delivery" ? "Envío" : "Retiro"} ·{" "}
                        {pedido.payment_method === "transfer"
                          ? "Transferencia"
                          : "Mercado Pago"}{" "}
                        · {formatFecha(pedido.created_at)}
                      </p>
                    </div>

                    <Insignia className={estado.clase}>{estado.label}</Insignia>

                    <p className="font-display text-lg text-carbon">
                      {formatARS(Number(pedido.total))}
                    </p>
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
