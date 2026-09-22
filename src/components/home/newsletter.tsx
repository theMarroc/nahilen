"use client";

import { useActionState } from "react";

import { suscribirNewsletter, type EstadoFormulario } from "@/actions/publico";
import { IconoFacebook, IconoInstagram, Isotipo } from "@/components/ui/marca";
import { ajuste, ajusteCrudo } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export function Newsletter({ ajustes }: { ajustes: Settings }) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    suscribirNewsletter,
    null,
  );

  const instagram = ajusteCrudo(ajustes, "instagram_url");
  const facebook = ajusteCrudo(ajustes, "facebook_url");

  return (
    <section className="relative overflow-hidden bg-mostaza py-12">
      <Isotipo className="pointer-events-none absolute -bottom-12 right-4 h-48 w-48 rotate-6 text-white/25" />

      <div className="contenedor relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="font-display text-2xl text-carbon">
              {ajuste(ajustes, "newsletter_titulo")}
            </h2>
            <p className="mt-1.5 text-sm text-carbon/75">
              {ajuste(ajustes, "newsletter_texto")}
            </p>
          </div>

          <form action={accion} className="flex flex-col gap-2">
            <div className="flex">
              <label htmlFor="email-newsletter" className="sr-only">
                Tu correo
              </label>
              <input
                id="email-newsletter"
                name="email"
                type="email"
                required
                placeholder="Tu email"
                className="min-w-0 flex-1 rounded-l-marca border-0 bg-white px-3.5 py-3 text-sm text-carbon placeholder:text-arena focus:outline-none focus:ring-2 focus:ring-inset focus:ring-carbon/30"
              />
              <button
                type="submit"
                disabled={enviando}
                className="rounded-r-marca bg-carbon px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-crema transition-colors hover:bg-carbon/85 disabled:opacity-60"
              >
                {enviando ? "Enviando" : "Suscribirme"}
              </button>
            </div>

            {estado ? (
              <p
                aria-live="polite"
                className={`text-xs font-semibold ${
                  estado.ok ? "text-oliva" : "text-terracota-oscuro"
                }`}
              >
                {estado.mensaje}
              </p>
            ) : null}
          </form>
        </div>

        {instagram || facebook ? (
          <div className="flex gap-2 lg:justify-end">
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-marca bg-white/70 p-2.5 text-marron transition-colors hover:bg-white"
              >
                <IconoInstagram />
              </a>
            ) : null}
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-marca bg-white/70 p-2.5 text-marron transition-colors hover:bg-white"
              >
                <IconoFacebook />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
