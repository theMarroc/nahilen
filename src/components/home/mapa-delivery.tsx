import { Clock, MapPin, Truck } from "lucide-react";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { estilosBoton } from "@/components/ui/boton";
import { aNumero, ajuste, ajusteCrudo, esVerdadero, linkWhatsapp } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { formatARS } from "@/lib/utils";

export function MapaDelivery({ ajustes }: { ajustes: Settings }) {
  const mapa = ajusteCrudo(ajustes, "mapa_embed_url");
  const costoEnvio = aNumero(ajustes.envio_costo);
  const envioGratis = aNumero(ajustes.envio_gratis_desde);
  const retiro = esVerdadero(ajustes.retiro_activo ?? "true");
  const direccionRetiro = ajusteCrudo(ajustes, "retiro_direccion");

  return (
    <section className="bg-crema py-16 lg:py-24">
      <div className="contenedor grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <EncabezadoSeccion
            titulo={ajuste(ajustes, "zona_delivery_titulo")}
            tituloCursiva={ajuste(ajustes, "zona_delivery_titulo_cursiva")}
            texto={ajuste(ajustes, "zona_delivery_texto")}
          />

          <ul className="mt-8 flex flex-col gap-4 text-sm text-carbon/75">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>
                Envío a domicilio:{" "}
                <strong className="font-semibold text-marron">
                  {costoEnvio > 0 ? formatARS(costoEnvio) : "a coordinar"}
                </strong>
                {envioGratis > 0 ? (
                  <> — sin cargo desde {formatARS(envioGratis)}</>
                ) : null}
              </span>
            </li>

            {retiro ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
                <span>
                  También podés retirar sin costo
                  {direccionRetiro ? <> en {direccionRetiro}</> : null}.
                </span>
              </li>
            ) : null}

            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>Coordinamos el día y el horario por WhatsApp.</span>
            </li>
          </ul>

          <a
            href={linkWhatsapp(
              ajuste(ajustes, "whatsapp_numero"),
              "¡Hola! Quería consultar si llegan con el delivery a mi zona",
            )}
            target="_blank"
            rel="noreferrer"
            className={estilosBoton("secundario", "md", "mt-8")}
          >
            Consultar por mi zona
          </a>
        </div>

        <div className="overflow-hidden rounded-marca border border-arena/30 bg-beige/30 shadow-suave">
          {mapa ? (
            <iframe
              src={mapa}
              title="Zona de entrega"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 lg:h-96"
            />
          ) : (
            <div className="flex h-80 flex-col items-center justify-center gap-3 px-6 text-center lg:h-96">
              <MapPin className="h-10 w-10 text-arena/70" strokeWidth={1.2} />
              <p className="max-w-xs text-sm text-arena">
                Pegá el mapa de tu zona desde el panel (Ajustes › Envíos) y se muestra acá.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
