import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PanelIngreso } from "@/components/site/panel-ingreso";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getUsuario } from "@/lib/auth";
import { modoDemo } from "@/lib/db";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default async function PaginaIngresar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string }>;
}) {
  const { volver, error } = await searchParams;
  const usuario = await getUsuario();

  if (usuario) redirect(volver?.startsWith("/") ? volver : "/mi-cuenta");

  return (
    <>
      <CabeceraPagina
        titulo="Tu"
        tituloCursiva="cuenta"
        texto="Tener cuenta es opcional: sirve para guardar tus direcciones y ver tus pedidos anteriores."
      />

      <div className="contenedor max-w-md py-12 lg:py-16">
        {error === "enlace" ? (
          <p className="mb-5 rounded-marca border border-terracota/40 bg-terracota/10 px-4 py-3 text-sm text-terracota-oscuro">
            Ese enlace ya no es válido. Probá ingresando con tu correo y contraseña.
          </p>
        ) : null}

        {modoDemo() ? (
          <p className="mb-5 rounded-marca border border-arena/40 bg-crema px-4 py-3 text-sm leading-relaxed text-carbon/75">
            El sistema de cuentas se activa cuando se conecta la base de datos.
          </p>
        ) : null}

        <PanelIngreso volver={volver ?? ""} />
      </div>
    </>
  );
}
