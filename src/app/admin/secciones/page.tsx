import type { Metadata } from "next";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

import { alternarSeccion, moverSeccion } from "@/actions/admin/contenido";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { getSecciones } from "@/lib/db";

export const metadata: Metadata = {
  title: "Secciones",
  robots: { index: false, follow: false },
};

export default async function SeccionesAdmin() {
  const secciones = (await getSecciones()).sort((a, b) => a.sort_order - b.sort_order);
  const activas = secciones.filter((s) => s.is_enabled).length;

  return (
    <>
      <TituloAdmin
        titulo="Secciones de la portada"
        texto="Prendé o apagá cada bloque de la página de inicio. Lo que apagás deja de verse, pero no se borra nada."
      />

      <p className="mb-5 flex items-center gap-2 text-sm text-carbon/70">
        <Eye className="h-4 w-4 text-oliva" strokeWidth={1.5} />
        {activas} de {secciones.length} secciones visibles
      </p>

      <PanelAdmin className="p-0! sm:p-0!">
        <ul className="divide-y divide-arena/20">
          {secciones.map((seccion, indice) => (
            <li
              key={seccion.key}
              className={`flex flex-wrap items-center gap-4 p-4 ${
                seccion.is_enabled ? "" : "bg-crema/40"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <form action={moverSeccion}>
                  <input type="hidden" name="key" value={seccion.key} />
                  <input type="hidden" name="direccion" value="arriba" />
                  <button
                    type="submit"
                    disabled={indice === 0}
                    title="Subir"
                    className="rounded-marca p-1 text-arena transition-colors hover:bg-beige/50 hover:text-marron disabled:opacity-25"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={moverSeccion}>
                  <input type="hidden" name="key" value={seccion.key} />
                  <input type="hidden" name="direccion" value="abajo" />
                  <button
                    type="submit"
                    disabled={indice === secciones.length - 1}
                    title="Bajar"
                    className="rounded-marca p-1 text-arena transition-colors hover:bg-beige/50 hover:text-marron disabled:opacity-25"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="min-w-48 flex-1">
                <p className="flex items-center gap-2 font-display text-lg text-marron">
                  {seccion.is_enabled ? (
                    <Eye className="h-4 w-4 text-oliva" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="h-4 w-4 text-arena" strokeWidth={1.5} />
                  )}
                  {seccion.label}
                </p>
                {seccion.description ? (
                  <p className="mt-0.5 text-sm leading-relaxed text-carbon/65">
                    {seccion.description}
                  </p>
                ) : null}
              </div>

              <Interruptor
                accion={alternarSeccion}
                campos={{ key: seccion.key }}
                activo={seccion.is_enabled}
                etiqueta={`Mostrar la sección ${seccion.label}`}
              />
            </li>
          ))}
        </ul>
      </PanelAdmin>

      <p className="mt-5 text-xs leading-relaxed text-arena">
        Algunas secciones se esconden solas cuando no hay nada que mostrar. Por ejemplo,
        &ldquo;Ofertas&rdquo; solo aparece si hay alguna oferta activa, y el carrusel
        necesita fotos cargadas en <strong>Textos y fotos</strong>.
      </p>
    </>
  );
}
