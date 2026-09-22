import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";

import {
  IconoFacebook,
  IconoInstagram,
  IconoWhatsapp,
  Logo,
  Ornamento,
} from "@/components/ui/marca";
import { ajuste, ajusteCrudo, linkWhatsapp } from "@/lib/settings";
import type { Category, Settings } from "@/lib/types";

export function Pie({
  ajustes,
  categorias,
}: {
  ajustes: Settings;
  categorias: Category[];
}) {
  const nombre = ajuste(ajustes, "marca_nombre");
  const instagram = ajusteCrudo(ajustes, "instagram_url");
  const facebook = ajusteCrudo(ajustes, "facebook_url");
  const email = ajusteCrudo(ajustes, "email_contacto");
  const whatsapp = ajuste(ajustes, "whatsapp_numero");
  const zona = ajuste(ajustes, "zona_delivery_texto");

  return (
    <footer className="mt-24 border-t border-arena/25 bg-crema">
      <div className="contenedor grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo nombre={nombre} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-carbon/70">
            {ajuste(ajustes, "hero_texto")}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-arena">
            {ajuste(ajustes, "marca_claim")}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-marron">
            Comprar
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm text-carbon/70">
            <li>
              <Link href="/tienda" className="transition-colors hover:text-terracota">
                Todos los productos
              </Link>
            </li>
            {categorias.map((categoria) => (
              <li key={categoria.id}>
                <Link
                  href={`/tienda?categoria=${categoria.slug}`}
                  className="transition-colors hover:text-terracota"
                >
                  {categoria.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/combos" className="transition-colors hover:text-terracota">
                Combos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-marron">
            Contacto
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm text-carbon/70">
            <li>
              <a
                href={linkWhatsapp(whatsapp, ajuste(ajustes, "whatsapp_mensaje"))}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-terracota"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> WhatsApp
              </a>
            </li>
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 transition-colors hover:text-terracota"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} /> {email}
                </a>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>{zona}</span>
            </li>
          </ul>

          <div className="mt-5 flex gap-2">
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-marca border border-arena/40 p-2 text-marron transition-colors hover:border-terracota hover:text-terracota"
              >
                <IconoInstagram className="h-4 w-4" />
              </a>
            ) : null}
            {facebook ? (
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-marca border border-arena/40 p-2 text-marron transition-colors hover:border-terracota hover:text-terracota"
              >
                <IconoFacebook className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <Ornamento className="pb-8" />

      <div className="border-t border-arena/25 py-5">
        <div className="contenedor flex flex-col items-center justify-between gap-3 text-xs text-arena sm:flex-row">
          <p>
            © {new Date().getFullYear()} {nombre}. Hecho a mano en Argentina.
          </p>
          <div className="flex gap-5">
            <Link href="/nosotros" className="transition-colors hover:text-marron">
              Nosotros
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-marron">
              Contacto
            </Link>
            <Link href="/mi-cuenta" className="transition-colors hover:text-marron">
              Mi cuenta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Boton flotante de WhatsApp, siempre visible. */
export function BotonWhatsapp({ ajustes }: { ajustes: Settings }) {
  const numero = ajuste(ajustes, "whatsapp_numero");
  if (!numero) return null;

  return (
    <a
      href={linkWhatsapp(numero, ajuste(ajustes, "whatsapp_mensaje"))}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-oliva text-white shadow-tarjeta transition-transform hover:scale-105"
    >
      <IconoWhatsapp className="h-6 w-6" />
    </a>
  );
}
