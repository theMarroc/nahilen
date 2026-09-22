import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role: ignora RLS.
 * Usarlo SOLO en el servidor (server actions / route handlers) y nunca con
 * datos que vengan directo del navegador sin validar antes.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
