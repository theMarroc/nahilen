"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

const esquema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Ponele un nombre a la oferta."),
    kind: z.enum(["percent", "amount"]),
    value: z.coerce.number().min(0, "El descuento no puede ser negativo."),
    scope: z.enum(["all", "category", "product"]),
    category_id: z.string().default(""),
    product_id: z.string().default(""),
    label: z.string().trim().max(30).default(""),
    starts_at: z.string().default(""),
    ends_at: z.string().default(""),
    is_active: z.boolean().default(true),
  })
  .refine((d) => d.kind !== "percent" || d.value <= 100, {
    message: "Un descuento por porcentaje no puede pasar de 100.",
    path: ["value"],
  })
  .refine((d) => d.scope !== "category" || Boolean(d.category_id), {
    message: "Elegí a qué categoría se aplica.",
    path: ["category_id"],
  })
  .refine((d) => d.scope !== "product" || Boolean(d.product_id), {
    message: "Elegí a qué producto se aplica.",
    path: ["product_id"],
  });

export async function guardarOferta(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    kind: datos.get("kind"),
    value: datos.get("value"),
    scope: datos.get("scope"),
    category_id: datos.get("category_id") ?? "",
    product_id: datos.get("product_id") ?? "",
    label: datos.get("label") ?? "",
    starts_at: datos.get("starts_at") ?? "",
    ends_at: datos.get("ends_at") ?? "",
    is_active: datos.get("is_active") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...campos } = analisis.data;

  const fila = {
    ...campos,
    // Solo se guarda el destino que corresponde al alcance elegido.
    category_id: campos.scope === "category" ? campos.category_id : null,
    product_id: campos.scope === "product" ? campos.product_id : null,
    label: campos.label || null,
    starts_at: campos.starts_at ? new Date(campos.starts_at).toISOString() : null,
    ends_at: campos.ends_at ? new Date(campos.ends_at).toISOString() : null,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("offers").update(fila).eq("id", id)
    : await supabase.from("offers").insert(fila);

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ofertas");

  return { ok: true, mensaje: id ? "Oferta actualizada." : "Oferta creada." };
}

export async function alternarOferta(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("offers").update({ is_active: activo }).eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/ofertas");
}

export async function borrarOferta(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("offers").delete().eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/ofertas");
}
