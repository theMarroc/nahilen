import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Notificaciones de Mercado Pago.
 *
 * No confiamos en el cuerpo del aviso: solo tomamos el id del pago y le
 * preguntamos a la API de Mercado Pago cuál es su estado real.
 */
export async function POST(request: Request) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ ok: false, motivo: "sin credenciales" }, { status: 200 });
  }

  let cuerpo: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    cuerpo = await request.json();
  } catch {
    // Mercado Pago también avisa con query params.
  }

  const url = new URL(request.url);
  const tipo = cuerpo.type ?? url.searchParams.get("type") ?? "";
  const idPago = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? "");

  if (!idPago || (tipo && tipo !== "payment")) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  try {
    const { MercadoPagoConfig, Payment } = await import("mercadopago");
    const cliente = new MercadoPagoConfig({ accessToken });
    const pago = await new Payment(cliente).get({ id: idPago });

    const referencia = pago.external_reference;
    if (!referencia) return NextResponse.json({ ok: true, ignorado: true });

    const estado =
      pago.status === "approved"
        ? "pagado"
        : pago.status === "rejected" || pago.status === "cancelled"
          ? "cancelado"
          : "pendiente_pago";

    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ status: estado, mp_payment_id: String(pago.id ?? idPago) })
      .eq("id", referencia);

    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    console.error("[mercadopago] error procesando la notificación", error);
    // Devolvemos 200 igual: si respondemos con error, Mercado Pago reintenta
    // indefinidamente. El pedido se puede confirmar a mano desde el panel.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
