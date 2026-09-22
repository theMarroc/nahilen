"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const ESTADOS: OrderStatus[] = [
  "pendiente_pago",
  "comprobante_enviado",
  "pagado",
  "en_preparacion",
  "entregado",
  "cancelado",
];

export async function cambiarEstadoPedido(datos: FormData) {
  await exigirAdmin();

  const analisis = z
    .object({ id: z.string().uuid(), estado: z.enum(ESTADOS as [OrderStatus, ...OrderStatus[]]) })
    .safeParse({ id: datos.get("id"), estado: datos.get("estado") });

  if (!analisis.success) return;

  const supabase = await createClient();
  const { id, estado } = analisis.data;

  const { data: pedido } = await supabase
    .from("orders")
    .select("id, status, items:order_items(product_id, quantity, kind)")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) return;

  await supabase.from("orders").update({ status: estado }).eq("id", id);

  // Al cancelar devolvemos el stock que se había reservado.
  if (estado === "cancelado" && pedido.status !== "cancelado") {
    for (const item of pedido.items ?? []) {
      if (item.kind !== "product" || !item.product_id) continue;

      const { data: producto } = await supabase
        .from("products")
        .select("id, stock, track_stock")
        .eq("id", item.product_id)
        .maybeSingle();

      if (producto?.track_stock) {
        await supabase
          .from("products")
          .update({ stock: producto.stock + item.quantity })
          .eq("id", producto.id);
      }
    }
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/", "layout");
}

/**
 * Link temporal (1 hora) para ver el comprobante.
 * El bucket es privado: no se puede acceder sin firmar la URL.
 */
export async function urlComprobante(ruta: string) {
  await exigirAdmin();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createAdminClient();
  const { data } = await supabase.storage
    .from("comprobantes")
    .createSignedUrl(ruta, 60 * 60);

  return data?.signedUrl ?? null;
}

export async function borrarPedido(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);

  revalidatePath("/admin/pedidos");
}
