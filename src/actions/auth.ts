"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

export type EstadoAuth = { ok: boolean; mensaje: string } | null;

const esquemaIngreso = z.object({
  email: z.string().trim().email("Revisá el correo."),
  password: z.string().min(6, "La contraseña tiene que tener al menos 6 caracteres."),
});

const esquemaRegistro = esquemaIngreso.extend({
  nombre: z.string().trim().min(2, "Escribí tu nombre."),
  telefono: z.string().trim().default(""),
});

function rutaSegura(valor: FormDataEntryValue | null) {
  const texto = String(valor ?? "");
  // Solo permitimos rutas internas: evita redirecciones a sitios externos.
  return texto.startsWith("/") && !texto.startsWith("//") ? texto : "/mi-cuenta";
}

export async function ingresar(
  _anterior: EstadoAuth,
  datos: FormData,
): Promise<EstadoAuth> {
  if (!supabaseConfigurado()) {
    return { ok: false, mensaje: "El sitio todavía no tiene la base de datos conectada." };
  }

  const analisis = esquemaIngreso.safeParse({
    email: datos.get("email"),
    password: datos.get("password"),
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(analisis.data);

  if (error) {
    return { ok: false, mensaje: "El correo o la contraseña no coinciden." };
  }

  revalidatePath("/", "layout");
  redirect(rutaSegura(datos.get("volver")));
}

export async function registrarse(
  _anterior: EstadoAuth,
  datos: FormData,
): Promise<EstadoAuth> {
  if (!supabaseConfigurado()) {
    return { ok: false, mensaje: "El sitio todavía no tiene la base de datos conectada." };
  }

  const analisis = esquemaRegistro.safeParse({
    email: datos.get("email"),
    password: datos.get("password"),
    nombre: datos.get("nombre"),
    telefono: datos.get("telefono") ?? "",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { email, password, nombre, telefono } = analisis.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: nombre, phone: telefono },
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : undefined,
    },
  });

  if (error) {
    const yaExiste = error.message.toLowerCase().includes("already");
    return {
      ok: false,
      mensaje: yaExiste
        ? "Ya hay una cuenta con ese correo. Probá ingresando."
        : "No pudimos crear la cuenta. Probá de nuevo.",
    };
  }

  // Si el proyecto pide confirmar el mail, todavía no hay sesión.
  if (!data.session) {
    return {
      ok: true,
      mensaje: "¡Listo! Te mandamos un correo para confirmar la cuenta.",
    };
  }

  revalidatePath("/", "layout");
  redirect(rutaSegura(datos.get("volver")));
}

export async function salir() {
  if (supabaseConfigurado()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}
