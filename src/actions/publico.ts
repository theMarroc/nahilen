"use server";

import { z } from "zod";

import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

export type EstadoFormulario = { ok: boolean; mensaje: string } | null;

const esquemaEmail = z.string().trim().email("Revisá el correo, parece incompleto.");

export async function suscribirNewsletter(
  _anterior: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const resultado = esquemaEmail.safeParse(datos.get("email"));

  if (!resultado.success) {
    return { ok: false, mensaje: resultado.error.issues[0].message };
  }

  if (!supabaseConfigurado()) {
    return {
      ok: false,
      mensaje: "El sitio todavía no está conectado a la base de datos.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: resultado.data.toLowerCase() });

  // 23505 = clave duplicada: ya estaba suscripto, no es un error para el visitante.
  if (error && error.code !== "23505") {
    return { ok: false, mensaje: "No pudimos guardarlo. ¿Probás de nuevo?" };
  }

  return { ok: true, mensaje: "¡Listo! Ya estás en la lista." };
}
