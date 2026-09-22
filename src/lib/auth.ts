import { redirect } from "next/navigation";

import { createClient, supabaseConfigurado } from "./supabase/server";
import type { Profile } from "./types";

export async function getUsuario() {
  if (!supabaseConfigurado()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getPerfil(): Promise<Profile | null> {
  if (!supabaseConfigurado()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? { id: user.id, full_name: null, phone: null, is_admin: false };
}

export async function esAdmin() {
  const perfil = await getPerfil();
  return Boolean(perfil?.is_admin);
}

/** Usar al principio de cada Server Action del panel. */
export async function exigirAdmin() {
  if (!(await esAdmin())) {
    throw new Error("No tenés permisos para hacer esto.");
  }
}

/** Usar en layouts/páginas del panel. */
export async function exigirAdminORedirigir() {
  const perfil = await getPerfil();
  if (!perfil) redirect("/ingresar?volver=/admin");
  if (!perfil.is_admin) redirect("/?sin-permiso=1");
  return perfil;
}

export async function exigirSesion(volverA = "/mi-cuenta") {
  const usuario = await getUsuario();
  if (!usuario) redirect(`/ingresar?volver=${encodeURIComponent(volverA)}`);
  return usuario;
}
