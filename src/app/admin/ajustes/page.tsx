import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { guardarAjustes } from "@/actions/admin/contenido";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { getAjustes } from "@/lib/db";
import { ajuste, ajusteCrudo, esVerdadero } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Ajustes",
  robots: { index: false, follow: false },
};

export default async function AjustesAdmin() {
  const ajustes = await getAjustes();
  const mpConfigurado = Boolean(process.env.MP_ACCESS_TOKEN);

  return (
    <>
      <TituloAdmin
        titulo="Ajustes"
        texto="Los datos de contacto, cómo cobrás y cómo entregás."
      />

      <div className="flex flex-col gap-6">
        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Marca y contacto">
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Nombre de la marca">
                <Campo
                  name="ajuste_marca_nombre"
                  defaultValue={ajuste(ajustes, "marca_nombre")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Frase de la marca" ayuda="Se ve en el pie">
                <Campo
                  name="ajuste_marca_claim"
                  defaultValue={ajuste(ajustes, "marca_claim")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Número de WhatsApp"
                requerido
                ayuda="Con código de país y sin espacios. Ej: 5492615551234"
              >
                <Campo
                  name="ajuste_whatsapp_numero"
                  inputMode="numeric"
                  defaultValue={ajusteCrudo(ajustes, "whatsapp_numero")}
                  placeholder="5492615551234"
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Mensaje que aparece escrito"
                ayuda="Cuando alguien toca el botón de WhatsApp"
              >
                <Campo
                  name="ajuste_whatsapp_mensaje"
                  defaultValue={ajuste(ajustes, "whatsapp_mensaje")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Email de contacto" ayuda="Opcional">
                <Campo
                  name="ajuste_email_contacto"
                  type="email"
                  defaultValue={ajusteCrudo(ajustes, "email_contacto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Link de Instagram">
                <Campo
                  name="ajuste_instagram_url"
                  type="url"
                  defaultValue={ajusteCrudo(ajustes, "instagram_url")}
                  placeholder="https://www.instagram.com/dulces.nahilen"
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Link de Facebook" ayuda="Opcional">
                <Campo
                  name="ajuste_facebook_url"
                  type="url"
                  defaultValue={ajusteCrudo(ajustes, "facebook_url")}
                />
              </CampoConEtiqueta>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Cómo cobrás">
          <FormularioAdmin accion={guardarAjustes}>
            <input
              type="hidden"
              name="__interruptores"
              value="pago_transferencia_activo,pago_mercadopago_activo"
            />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 rounded-marca border border-arena/30 bg-crema/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                  <input
                    type="checkbox"
                    name="ajuste_pago_transferencia_activo"
                    defaultChecked={esVerdadero(
                      ajustes.pago_transferencia_activo ?? "true",
                    )}
                    className="mt-0.5 h-4 w-4 accent-terracota"
                  />
                  <span>
                    <span className="font-semibold text-marron">
                      Cobrar por transferencia
                    </span>
                    <br />
                    El cliente transfiere y sube el comprobante en la web.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoConEtiqueta etiqueta="Titular de la cuenta">
                    <Campo
                      name="ajuste_transferencia_titular"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_titular")}
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Banco o billetera">
                    <Campo
                      name="ajuste_transferencia_banco"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_banco")}
                      placeholder="Mercado Pago, Banco Nación..."
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Alias">
                    <Campo
                      name="ajuste_transferencia_alias"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_alias")}
                      placeholder="nahilen.dulces"
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="CBU o CVU">
                    <Campo
                      name="ajuste_transferencia_cbu"
                      inputMode="numeric"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_cbu")}
                    />
                  </CampoConEtiqueta>
                </div>
              </div>

              <div className="rounded-marca border border-arena/30 bg-crema/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                  <input
                    type="checkbox"
                    name="ajuste_pago_mercadopago_activo"
                    defaultChecked={esVerdadero(ajustes.pago_mercadopago_activo)}
                    disabled={!mpConfigurado}
                    className="mt-0.5 h-4 w-4 accent-terracota"
                  />
                  <span>
                    <span className="font-semibold text-marron">
                      Cobrar con Mercado Pago
                    </span>
                    <br />
                    El cliente paga con tarjeta o dinero en cuenta y el pedido se marca
                    como pagado solo.
                  </span>
                </label>

                {!mpConfigurado ? (
                  <p className="mt-3 flex items-start gap-2 rounded-marca border border-mostaza/50 bg-mostaza/15 px-3 py-2.5 text-xs leading-relaxed text-marron">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
                    Para activarlo falta cargar la credencial de Mercado Pago
                    (MP_ACCESS_TOKEN) en el servidor. Está explicado en el README: es una
                    clave secreta, así que no se puede cargar desde acá.
                  </p>
                ) : null}
              </div>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Envíos y retiro">
          <FormularioAdmin accion={guardarAjustes}>
            <input type="hidden" name="__interruptores" value="retiro_activo" />

            <div className="grid gap-4 sm:grid-cols-3">
              <CampoConEtiqueta
                etiqueta="Costo del envío"
                ayuda="0 = a coordinar por WhatsApp"
              >
                <Campo
                  name="ajuste_envio_costo"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={ajustes.envio_costo ?? "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Envío gratis desde"
                ayuda="0 = sin envío gratis"
              >
                <Campo
                  name="ajuste_envio_gratis_desde"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={ajustes.envio_gratis_desde ?? "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Pedido mínimo" ayuda="0 = sin mínimo">
                <Campo
                  name="ajuste_pedido_minimo"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={ajustes.pedido_minimo ?? "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Dirección de retiro"
                className="sm:col-span-3"
                ayuda="Se muestra a quien elige retirar"
              >
                <Campo
                  name="ajuste_retiro_direccion"
                  defaultValue={ajusteCrudo(ajustes, "retiro_direccion")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Texto de la zona de entrega"
                className="sm:col-span-3"
              >
                <AreaTexto
                  name="ajuste_zona_delivery_texto"
                  rows={2}
                  defaultValue={ajuste(ajustes, "zona_delivery_texto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título de la sección" className="sm:col-span-1">
                <Campo
                  name="ajuste_zona_delivery_titulo"
                  defaultValue={ajuste(ajustes, "zona_delivery_titulo")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Título en cursiva"
                className="sm:col-span-2"
                ayuda="La parte que se ve en color"
              >
                <Campo
                  name="ajuste_zona_delivery_titulo_cursiva"
                  defaultValue={ajuste(ajustes, "zona_delivery_titulo_cursiva")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Mapa de la zona"
                className="sm:col-span-3"
                ayuda='En Google Maps: Compartir › Insertar un mapa › copiá solo el link que está dentro de src="..."'
              >
                <Campo
                  name="ajuste_mapa_embed_url"
                  type="url"
                  defaultValue={ajusteCrudo(ajustes, "mapa_embed_url")}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </CampoConEtiqueta>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-sm text-carbon/80">
              <input
                type="checkbox"
                name="ajuste_retiro_activo"
                defaultChecked={esVerdadero(ajustes.retiro_activo ?? "true")}
                className="mt-0.5 h-4 w-4 accent-terracota"
              />
              <span>
                <span className="font-semibold text-marron">Permitir retiro</span>
                <br />
                Aparece la opción de retirar sin costo al finalizar el pedido.
              </span>
            </label>
          </FormularioAdmin>
        </PanelAdmin>
      </div>
    </>
  );
}
