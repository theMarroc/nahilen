"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";
import { slugify } from "@/lib/utils";

const esquemaItem = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(50),
});

const esquema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ponele un nombre al combo."),
  description: z.string().trim().max(400).default(""),
  image_url: z.string().trim().default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function guardarCombo(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    description: datos.get("description") ?? "",
    image_url: datos.get("image_url") ?? "",
    price: datos.get("price"),
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  let items: z.infer<typeof esquemaItem>[] = [];
  try {
    items = z.array(esquemaItem).parse(JSON.parse(String(datos.get("items") ?? "[]")));
  } catch {
    items = [];
  }

  if (items.length === 0) {
    return { ok: false, mensaje: "Agregá al menos un producto al combo." };
  }

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();

  const fila = {
    ...campos,
    description: campos.description || null,
    image_url: campos.image_url || null,
    ...(id ? {} : { slug: slugify(campos.name) || `combo-${Date.now()}` }),
  };

  const { data: guardado, error } = id
    ? await supabase.from("combos").update(fila).eq("id", id).select("id").single()
    : await supabase.from("combos").insert(fila).select("id").single();

  if (error || !guardado) {
    const duplicado = error?.code === "23505";
    return {
      ok: false,
      mensaje: duplicado
        ? "Ya existe un combo con ese nombre."
        : `No se pudo guardar: ${error?.message ?? "error"}`,
    };
  }

  await supabase.from("combo_items").delete().eq("combo_id", guardado.id);
  await supabase.from("combo_items").insert(
    items.map((item) => ({ ...item, combo_id: guardado.id })),
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/combos");

  if (!id) redirect(`/admin/combos/${guardado.id}?nuevo=1`);

  return { ok: true, mensaje: "Combo guardado." };
}

export async function alternarCombo(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("combos").update({ is_active: activo }).eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/combos");
}

export async function borrarCombo(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("combos").delete().eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/combos");
  redirect("/admin/combos");
}
