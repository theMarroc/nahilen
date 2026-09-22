"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { AJUSTES_POR_DEFECTO } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

const CLAVES_VALIDAS = new Set(Object.keys(AJUSTES_POR_DEFECTO));

function refrescar() {
  revalidatePath("/", "layout");
}

/* ==========================================================================
   Secciones de la portada
   ========================================================================== */

export async function alternarSeccion(datos: FormData) {
  await exigirAdmin();
  const key = String(datos.get("key") ?? "");
  const activo = datos.get("activo") === "true";
  if (!key) return;

  const supabase = await createClient();
  await supabase.from("sections").update({ is_enabled: activo }).eq("key", key);

  refrescar();
  revalidatePath("/admin/secciones");
}

export async function moverSeccion(datos: FormData) {
  await exigirAdmin();
  const key = String(datos.get("key") ?? "");
  const direccion = String(datos.get("direccion") ?? "");
  if (!key || !["arriba", "abajo"].includes(direccion)) return;

  const supabase = await createClient();
  const { data: secciones } = await supabase
    .from("sections")
    .select("key, sort_order")
    .order("sort_order");

  if (!secciones) return;

  const indice = secciones.findIndex((s) => s.key === key);
  const destino = direccion === "arriba" ? indice - 1 : indice + 1;
  if (indice < 0 || destino < 0 || destino >= secciones.length) return;

  // Intercambiamos las posiciones de las dos secciones.
  const actual = secciones[indice];
  const vecina = secciones[destino];

  await supabase
    .from("sections")
    .update({ sort_order: vecina.sort_order })
    .eq("key", actual.key);
  await supabase
    .from("sections")
    .update({ sort_order: actual.sort_order })
    .eq("key", vecina.key);

  refrescar();
  revalidatePath("/admin/secciones");
}

/* ==========================================================================
   Ajustes (textos, pagos, envíos, contacto)
   ========================================================================== */

/**
 * Guarda todos los campos del formulario cuyo nombre empiece con `ajuste_`.
 * Así una sola acción sirve para todas las pantallas de configuración.
 */
export async function guardarAjustes(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const filas: { key: string; value: string }[] = [];
  const interruptores = String(datos.get("__interruptores") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const [nombre, valor] of datos.entries()) {
    if (!nombre.startsWith("ajuste_")) continue;
    const clave = nombre.slice("ajuste_".length);
    if (!CLAVES_VALIDAS.has(clave)) continue;
    filas.push({ key: clave, value: String(valor) });
  }

  // Un checkbox sin marcar no llega en el FormData: lo guardamos en "false".
  for (const clave of interruptores) {
    if (!CLAVES_VALIDAS.has(clave)) continue;
    if (!filas.some((f) => f.key === clave)) {
      filas.push({ key: clave, value: "false" });
    } else {
      const fila = filas.find((f) => f.key === clave)!;
      fila.value = "true";
    }
  }

  if (filas.length === 0) {
    return { ok: false, mensaje: "No había nada para guardar." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert(filas, { onConflict: "key" });

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  refrescar();
  revalidatePath("/admin/ajustes");
  revalidatePath("/admin/contenido");

  return { ok: true, mensaje: "Cambios guardados." };
}

/* ==========================================================================
   Beneficios (la barra de "hecho a mano", "envíos", etc.)
   ========================================================================== */

const esquemaBeneficio = z.object({
  id: z.string().uuid().optional(),
  icon: z.string().trim().min(1).default("hoja"),
  title: z.string().trim().min(2, "Falta el título."),
  subtitle: z.string().trim().max(60).default(""),
  sort_order: z.coerce.number().int().default(0),
});

export async function guardarBeneficio(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaBeneficio.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    icon: datos.get("icon") ?? "hoja",
    title: datos.get("title"),
    subtitle: datos.get("subtitle") ?? "",
    sort_order: datos.get("sort_order") ?? 0,
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...campos } = analisis.data;
  const fila = { ...campos, subtitle: campos.subtitle || null };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("benefits").update(fila).eq("id", id)
    : await supabase.from("benefits").insert(fila);

  if (error) {
    return {
      ok: false,
      mensaje:
        error.code === "23505"
          ? "Ya hay un beneficio con ese título."
          : `No se pudo guardar: ${error.message}`,
    };
  }

  refrescar();
  revalidatePath("/admin/contenido");
  return { ok: true, mensaje: "Beneficio guardado." };
}

export async function borrarBeneficio(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("benefits").delete().eq("id", id);

  refrescar();
  revalidatePath("/admin/contenido");
}

/* ==========================================================================
   Preguntas frecuentes
   ========================================================================== */

const esquemaFaq = z.object({
  id: z.string().uuid().optional(),
  question: z.string().trim().min(5, "Falta la pregunta."),
  answer: z.string().trim().min(5, "Falta la respuesta."),
  sort_order: z.coerce.number().int().default(0),
});

export async function guardarFaq(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaFaq.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    question: datos.get("question"),
    answer: datos.get("answer"),
    sort_order: datos.get("sort_order") ?? 0,
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("faqs").update(campos).eq("id", id)
    : await supabase.from("faqs").insert(campos);

  if (error) {
    return {
      ok: false,
      mensaje:
        error.code === "23505"
          ? "Esa pregunta ya está cargada."
          : `No se pudo guardar: ${error.message}`,
    };
  }

  refrescar();
  revalidatePath("/admin/contenido");
  return { ok: true, mensaje: "Pregunta guardada." };
}

export async function borrarFaq(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("faqs").delete().eq("id", id);

  refrescar();
  revalidatePath("/admin/contenido");
}

export async function alternarFaq(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("faqs").update({ is_active: activo }).eq("id", id);

  refrescar();
  revalidatePath("/admin/contenido");
}

/* ==========================================================================
   Galería del carrusel
   ========================================================================== */

export async function agregarFotoGaleria(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const url = String(datos.get("url") ?? "").trim();
  const caption = String(datos.get("caption") ?? "").trim();

  if (!url) return { ok: false, mensaje: "Subí una foto primero." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("gallery_images")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("gallery_images").insert({
    url,
    caption: caption || null,
    sort_order: count ?? 0,
  });

  if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };

  refrescar();
  revalidatePath("/admin/contenido");
  return { ok: true, mensaje: "Foto agregada al carrusel." };
}

export async function borrarFotoGaleria(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("gallery_images").delete().eq("id", id);

  refrescar();
  revalidatePath("/admin/contenido");
}
