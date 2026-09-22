"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin, getUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";
import { redondear } from "@/lib/utils";

const esquema = z.object({
  porcentaje: z.coerce
    .number()
    .min(-90, "No se puede bajar más del 90%.")
    .max(500, "Ese aumento es demasiado grande."),
  alcance: z.enum(["todos", "categoria"]),
  categoria: z.string().default(""),
  redondeo: z.enum(["1", "10", "50", "100", "500"]),
  motivo: z.string().trim().max(120).default(""),
});

/**
 * Aumento (o baja) de precios en lote.
 * Guarda cada cambio en `price_changes` con un mismo batch_id para poder
 * deshacer toda la tanda de una sola vez.
 */
export async function aplicarAumento(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    porcentaje: datos.get("porcentaje"),
    alcance: datos.get("alcance"),
    categoria: datos.get("categoria") ?? "",
    redondeo: datos.get("redondeo") ?? "1",
    motivo: datos.get("motivo") ?? "",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { porcentaje, alcance, categoria, redondeo, motivo } = analisis.data;

  if (porcentaje === 0) {
    return { ok: false, mensaje: "Poné un porcentaje distinto de cero." };
  }
  if (alcance === "categoria" && !categoria) {
    return { ok: false, mensaje: "Elegí una categoría." };
  }

  const supabase = await createClient();
  const usuario = await getUsuario();

  let consulta = supabase.from("products").select("id, name, price");
  if (alcance === "categoria") consulta = consulta.eq("category_id", categoria);

  const { data: productos, error } = await consulta;
  if (error) return { ok: false, mensaje: `No se pudo leer el catálogo: ${error.message}` };
  if (!productos || productos.length === 0) {
    return { ok: false, mensaje: "No hay productos para actualizar." };
  }

  const loteId = crypto.randomUUID();
  const historial: Record<string, unknown>[] = [];
  let actualizados = 0;

  for (const producto of productos) {
    const anterior = Number(producto.price);
    const nuevo = Math.max(
      0,
      redondear(anterior * (1 + porcentaje / 100), redondeo),
    );

    if (nuevo === anterior) continue;

    const { error: errorUpdate } = await supabase
      .from("products")
      .update({ price: nuevo })
      .eq("id", producto.id);

    if (errorUpdate) continue;

    actualizados += 1;
    historial.push({
      batch_id: loteId,
      product_id: producto.id,
      product_name: producto.name,
      old_price: anterior,
      new_price: nuevo,
      reason: motivo || `${porcentaje > 0 ? "Aumento" : "Baja"} del ${porcentaje}%`,
      created_by: usuario?.id ?? null,
    });
  }

  if (historial.length > 0) {
    await supabase.from("price_changes").insert(historial);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/precios");
  revalidatePath("/admin/productos");

  if (actualizados === 0) {
    return { ok: false, mensaje: "Ningún precio cambió con ese porcentaje." };
  }

  return {
    ok: true,
    mensaje: `Listo: se actualizaron ${actualizados} ${
      actualizados === 1 ? "precio" : "precios"
    }.`,
  };
}

/** Vuelve los precios de una tanda a como estaban antes. */
export async function deshacerAumento(datos: FormData) {
  await exigirAdmin();
  const loteId = String(datos.get("batch_id") ?? "");
  if (!loteId) return;

  const supabase = await createClient();
  const { data: cambios } = await supabase
    .from("price_changes")
    .select("id, product_id, old_price")
    .eq("batch_id", loteId)
    .is("reverted_at", null);

  if (!cambios || cambios.length === 0) return;

  for (const cambio of cambios) {
    if (!cambio.product_id) continue;
    await supabase
      .from("products")
      .update({ price: cambio.old_price })
      .eq("id", cambio.product_id);
  }

  await supabase
    .from("price_changes")
    .update({ reverted_at: new Date().toISOString() })
    .eq("batch_id", loteId);

  revalidatePath("/", "layout");
  revalidatePath("/admin/precios");
  revalidatePath("/admin/productos");
}

/** Cambia el precio de un solo producto desde la tabla de precios. */
export async function cambiarPrecioSuelto(datos: FormData) {
  await exigirAdmin();

  const id = String(datos.get("id") ?? "");
  const nuevo = Number(datos.get("precio"));
  if (!id || !Number.isFinite(nuevo) || nuevo < 0) return;

  const supabase = await createClient();
  const usuario = await getUsuario();

  const { data: producto } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("id", id)
    .maybeSingle();

  if (!producto) return;
  const anterior = Number(producto.price);
  if (anterior === nuevo) return;

  await supabase.from("products").update({ price: nuevo }).eq("id", id);
  await supabase.from("price_changes").insert({
    product_id: producto.id,
    product_name: producto.name,
    old_price: anterior,
    new_price: nuevo,
    reason: "Cambio manual",
    created_by: usuario?.id ?? null,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/precios");
  revalidatePath("/admin/productos");
}
