"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PEDIDO, type EstadoAdmin, type OrderStatus } from "@/lib/types";

const ESTADOS = Object.keys(ESTADOS_PEDIDO) as [OrderStatus, ...OrderStatus[]];

type ItemPedido = { kind: string; product_id: string | null; quantity: number };

/** Estas acciones siempre responden algo, a diferencia de un formulario recién montado. */
type Resultado = NonNullable<EstadoAdmin>;

/**
 * Un pedido "retiene" su stock en cualquier estado salvo cancelado: se
 * descuenta al crearlo y solo vuelve si se cancela (o se borra sin entregar).
 */
const retieneStock = (estado: OrderStatus) => estado !== "cancelado";

/** Suma (signo 1) o resta (signo -1) las unidades de un pedido al stock. */
async function ajustarStock(supabase: SupabaseClient, items: ItemPedido[], signo: 1 | -1) {
  for (const item of items) {
    if (item.kind !== "product" || !item.product_id) continue;

    const { data: producto } = await supabase
      .from("products")
      .select("id, stock, track_stock")
      .eq("id", item.product_id)
      .maybeSingle();

    if (producto?.track_stock) {
      await supabase
        .from("products")
        .update({ stock: producto.stock + signo * item.quantity })
        .eq("id", producto.id);
    }
  }
}

export async function cambiarEstadoPedido(
  id: string,
  estado: OrderStatus,
): Promise<Resultado> {
  await exigirAdmin();

  const analisis = z
    .object({ id: z.string().uuid(), estado: z.enum(ESTADOS) })
    .safeParse({ id, estado });
  if (!analisis.success) return { ok: false, mensaje: "Ese estado no es válido." };

  const supabase = await createClient();
  const { data: pedido } = await supabase
    .from("orders")
    .select("id, status, items:order_items(product_id, quantity, kind)")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) return { ok: false, mensaje: "No encontramos el pedido." };

  const anterior = pedido.status as OrderStatus;
  if (anterior === estado) {
    return { ok: true, mensaje: `El pedido ya estaba como "${ESTADOS_PEDIDO[estado].label}".` };
  }

  // Pedimos la fila de vuelta: si RLS bloqueara el cambio, Supabase no da
  // error, simplemente no actualiza nada. Así lo detectamos.
  const { data: actualizado, error } = await supabase
    .from("orders")
    .update({ status: estado })
    .eq("id", id)
    .select("id");

  if (error || !actualizado?.length) {
    return { ok: false, mensaje: "No se pudo cambiar el estado. Probá de nuevo." };
  }

  const items = (pedido.items ?? []) as ItemPedido[];
  const cambiaStock = retieneStock(anterior) !== retieneStock(estado);

  if (cambiaStock) {
    // Cancelar devuelve las unidades; reactivar un cancelado las vuelve a tomar.
    await ajustarStock(supabase, items, retieneStock(estado) ? -1 : 1);
    revalidatePath("/", "layout");
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);

  return { ok: true, mensaje: `Estado actualizado: ${ESTADOS_PEDIDO[estado].label}.` };
}

/**
 * Borra un pedido, su detalle y el comprobante.
 *
 * Se hace con la clave de servicio: la base no permite borrar pedidos con la
 * sesión del navegador, así que la única forma es pasar por acá, después de
 * verificar que quien lo pide es administradora.
 */
export async function borrarPedido(id: string): Promise<Resultado> {
  await exigirAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, mensaje: "Pedido inválido." };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, mensaje: "Falta la clave de servicio de Supabase en el servidor." };
  }

  const admin = createAdminClient();
  const { data: pedido } = await admin
    .from("orders")
    .select("id, code, status, receipt_path, items:order_items(product_id, quantity, kind)")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) return { ok: false, mensaje: "Ese pedido ya no existe." };

  const { error } = await admin.from("orders").delete().eq("id", id);
  if (error) return { ok: false, mensaje: "No se pudo borrar el pedido. Probá de nuevo." };

  if (pedido.receipt_path) {
    await admin.storage.from("comprobantes").remove([pedido.receipt_path]);
  }

  // Si se borra un pedido que no llegó a entregarse, sus unidades vuelven al
  // stock. Uno entregado ya consumió su mercadería, y uno cancelado ya la devolvió.
  const estado = pedido.status as OrderStatus;
  if (retieneStock(estado) && estado !== "entregado") {
    await ajustarStock(admin, (pedido.items ?? []) as ItemPedido[], 1);
    revalidatePath("/", "layout");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  redirect(`/admin/pedidos?borrado=${encodeURIComponent(pedido.code)}`);
}
