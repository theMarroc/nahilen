"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirSesion } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoDireccion = { ok: boolean; mensaje: string } | null;

const esquema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, "Ponele un nombre (casa, trabajo, mamá...).").max(60),
  street: z.string().trim().min(2, "Falta la calle."),
  number: z.string().trim().min(1, "Falta la altura."),
  apartment: z.string().trim().max(40).default(""),
  city: z.string().trim().min(2, "Falta la localidad."),
  zone: z.string().trim().max(60).default(""),
  postal_code: z.string().trim().max(12).default(""),
  notes: z.string().trim().max(300).default(""),
  is_default: z.boolean().default(false),
});

export async function guardarDireccion(
  _anterior: EstadoDireccion,
  datos: FormData,
): Promise<EstadoDireccion> {
  const usuario = await exigirSesion();

  const idCrudo = String(datos.get("id") ?? "");
  const analisis = esquema.safeParse({
    id: idCrudo || undefined,
    label: datos.get("label"),
    street: datos.get("street"),
    number: datos.get("number"),
    apartment: datos.get("apartment") ?? "",
    city: datos.get("city"),
    zone: datos.get("zone") ?? "",
    postal_code: datos.get("postal_code") ?? "",
    notes: datos.get("notes") ?? "",
    is_default: datos.get("is_default") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...direccion } = analisis.data;
  const supabase = await createClient();

  const fila = {
    ...direccion,
    apartment: direccion.apartment || null,
    zone: direccion.zone || null,
    postal_code: direccion.postal_code || null,
    notes: direccion.notes || null,
    user_id: usuario.id,
  };

  const { error } = id
    ? await supabase.from("addresses").update(fila).eq("id", id)
    : await supabase.from("addresses").insert(fila);

  if (error) {
    return { ok: false, mensaje: "No pudimos guardar la dirección. Probá de nuevo." };
  }

  // Solo puede haber una dirección predeterminada.
  if (direccion.is_default) {
    const consulta = supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", usuario.id);
    await (id ? consulta.neq("id", id) : consulta.eq("is_default", true));

    if (id) {
      await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    }
  }

  revalidatePath("/mi-cuenta");
  revalidatePath("/checkout");

  return { ok: true, mensaje: id ? "Dirección actualizada." : "Dirección guardada." };
}

export async function borrarDireccion(datos: FormData) {
  const usuario = await exigirSesion();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", usuario.id);

  revalidatePath("/mi-cuenta");
  revalidatePath("/checkout");
}

export async function marcarPredeterminada(datos: FormData) {
  const usuario = await exigirSesion();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", usuario.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", usuario.id);

  revalidatePath("/mi-cuenta");
  revalidatePath("/checkout");
}
