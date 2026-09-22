import { NextResponse } from "next/server";

import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

/**
 * Destino de los links de confirmación de correo y recuperación de contraseña
 * que manda Supabase.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destinoCrudo = url.searchParams.get("next") ?? "/mi-cuenta";
  const destino =
    destinoCrudo.startsWith("/") && !destinoCrudo.startsWith("//")
      ? destinoCrudo
      : "/mi-cuenta";

  if (code && supabaseConfigurado()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destino, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/ingresar?error=enlace", url.origin));
}
