import type { Metadata } from "next";

import { FormularioCheckout } from "@/components/checkout/formulario-checkout";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getUsuario } from "@/lib/auth";
import { getAjustes } from "@/lib/db";
import { aNumero, ajuste, ajusteCrudo, esVerdadero } from "@/lib/settings";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import type { Address } from "@/lib/types";

export const metadata: Metadata = {
  title: "Finalizar pedido",
};

export default async function PaginaCheckout() {
  const [ajustes, usuario] = await Promise.all([getAjustes(), getUsuario()]);

  let direcciones: Address[] = [];
  if (usuario && supabaseConfigurado()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", usuario.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    direcciones = data ?? [];
  }

  return (
    <>
      <CabeceraPagina
        titulo="Finalizar"
        tituloCursiva="pedido"
        texto="Completá tus datos y elegí cómo querés pagar. Te confirmamos todo por WhatsApp."
      />

      <div className="contenedor py-10 lg:py-14">
        <FormularioCheckout
          usuario={
            usuario
              ? {
                  email: usuario.email ?? "",
                  nombre:
                    (usuario.user_metadata?.full_name as string | undefined) ?? "",
                  telefono: (usuario.user_metadata?.phone as string | undefined) ?? "",
                }
              : null
          }
          direcciones={direcciones}
          costoEnvio={aNumero(ajustes.envio_costo)}
          envioGratisDesde={aNumero(ajustes.envio_gratis_desde)}
          pedidoMinimo={aNumero(ajustes.pedido_minimo)}
          retiroActivo={esVerdadero(ajustes.retiro_activo ?? "true")}
          retiroDireccion={ajusteCrudo(ajustes, "retiro_direccion")}
          mercadopagoActivo={esVerdadero(ajustes.pago_mercadopago_activo)}
          transferenciaActiva={esVerdadero(ajustes.pago_transferencia_activo ?? "true")}
          whatsapp={ajuste(ajustes, "whatsapp_numero")}
        />
      </div>
    </>
  );
}
