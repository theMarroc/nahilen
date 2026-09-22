"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";
import { slugify } from "@/lib/utils";

const esquema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ponele un nombre a la categoría."),
  description: z.string().trim().max(200).default(""),
  image_url: z.string().trim().default(""),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function guardarCategoria(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    description: datos.get("description") ?? "",
    image_url: datos.get("image_url") ?? "",
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();

  const fila = {
    ...campos,
    description: campos.description || null,
    image_url: campos.image_url || null,
    ...(id ? {} : { slug: slugify(campos.name) || `categoria-${Date.now()}` }),
  };

  const { error } = id
    ? await supabase.from("categories").update(fila).eq("id", id)
    : await supabase.from("categories").insert(fila);

  if (error) {
    const duplicado = error.code === "23505";
    return {
      ok: false,
      mensaje: duplicado
        ? "Ya existe una categoría con ese nombre."
        : `No se pudo guardar: ${error.message}`,
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categorias");

  return { ok: true, mensaje: id ? "Categoría actualizada." : "Categoría creada." };
}

export async function alternarCategoria(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("categories").update({ is_active: activo }).eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/categorias");
}

export async function borrarCategoria(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  // Los productos no se borran: quedan sin categoría (ON DELETE SET NULL).
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/admin/categorias");
}
