import type { Metadata } from "next";

import { VistaCarrito } from "@/components/cart/vista-carrito";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getAjustes } from "@/lib/db";
import { aNumero } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Tu pedido",
};

export default async function PaginaCarrito() {
  const ajustes = await getAjustes();

  return (
    <>
      <CabeceraPagina titulo="Tu" tituloCursiva="pedido" />
      <div className="contenedor py-10 lg:py-14">
        <VistaCarrito
          costoEnvio={aNumero(ajustes.envio_costo)}
          envioGratisDesde={aNumero(ajustes.envio_gratis_desde)}
          pedidoMinimo={aNumero(ajustes.pedido_minimo)}
        />
      </div>
    </>
  );
}
