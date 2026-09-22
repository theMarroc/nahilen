import type { Metadata } from "next";

import { TarjetaCombo } from "@/components/shop/tarjeta-producto";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getAjustes, getCombos } from "@/lib/db";
import { ajuste } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Combos",
  description: "Combos y cajas armadas para regalar o para tener en casa.",
};

export default async function PaginaCombos() {
  const [combos, ajustes] = await Promise.all([getCombos(), getAjustes()]);

  return (
    <>
      <CabeceraPagina
        titulo={ajuste(ajustes, "combos_titulo")}
        tituloCursiva={ajuste(ajustes, "combos_titulo_cursiva")}
        texto="Armamos combinaciones a mejor precio que comprando cada cosa por separado."
      />

      <div className="contenedor py-10 lg:py-14">
        {combos.length === 0 ? (
          <p className="rounded-marca border border-dashed border-arena/50 bg-crema/60 px-6 py-12 text-center text-sm text-arena">
            Todavía no hay combos armados. Volvé a mirar en unos días.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {combos.map((combo) => (
              <TarjetaCombo key={combo.id} combo={combo} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
