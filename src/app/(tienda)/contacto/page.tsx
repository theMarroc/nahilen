import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";

import { SeccionPreguntas } from "@/components/home/preguntas";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { FormularioContacto } from "@/components/site/formulario-contacto";
import { estilosBoton } from "@/components/ui/boton";
import { IconoFacebook, IconoInstagram, IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes, getFaqs, getSeccionesActivas } from "@/lib/db";
import { ajuste, ajusteCrudo, linkWhatsapp } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contacto",
};

export default async function PaginaContacto() {
  const [ajustes, preguntas, secciones] = await Promise.all([
    getAjustes(),
    getFaqs(),
    getSeccionesActivas(),
  ]);

  const whatsapp = ajuste(ajustes, "whatsapp_numero");
  const email = ajusteCrudo(ajustes, "email_contacto");
  const instagram = ajusteCrudo(ajustes, "instagram_url");
  const facebook = ajusteCrudo(ajustes, "facebook_url");

  return (
    <>
      <CabeceraPagina
        titulo="Hablemos"
        texto="La forma más rápida es por WhatsApp. También podés escribirnos por Instagram o dejarnos un mensaje acá."
      />

      <section className="contenedor grid gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div>
          <h2 className="font-display text-2xl text-marron">Por dónde encontrarnos</h2>
          <span className="linea-decorativa mt-3" />

          <ul className="mt-6 flex flex-col gap-5 text-sm">
            <li>
              <a
                href={linkWhatsapp(whatsapp, ajuste(ajustes, "whatsapp_mensaje"))}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-carbon/80 transition-colors hover:text-terracota"
              >
                <IconoWhatsapp className="mt-0.5 h-5 w-5 shrink-0 text-oliva" />
                <span>
                  <span className="block font-semibold text-marron">WhatsApp</span>
                  Te contestamos en el día
                </span>
              </a>
            </li>

            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 text-carbon/80 transition-colors hover:text-terracota"
                >
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
                  <span>
                    <span className="block font-semibold text-marron">Email</span>
                    {email}
                  </span>
                </a>
              </li>
            ) : null}

            <li className="flex items-start gap-3 text-carbon/80">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>
                <span className="block font-semibold text-marron">Zona de entrega</span>
                {ajuste(ajustes, "zona_delivery_texto")}
              </span>
            </li>

            <li className="flex items-start gap-3 text-carbon/80">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>
                <span className="block font-semibold text-marron">Pedidos</span>
                Los tomamos todos los días por la web o por WhatsApp
              </span>
            </li>
          </ul>

          {instagram || facebook ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className={estilosBoton("secundario", "sm")}
                >
                  <IconoInstagram className="h-4 w-4" />
                  Instagram
                </a>
              ) : null}
              {facebook ? (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noreferrer"
                  className={estilosBoton("secundario", "sm")}
                >
                  <IconoFacebook className="h-4 w-4" />
                  Facebook
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <FormularioContacto whatsapp={whatsapp} />
      </section>

      {secciones.faq ? (
        <SeccionPreguntas preguntas={preguntas} ajustes={ajustes} />
      ) : null}
    </>
  );
}
