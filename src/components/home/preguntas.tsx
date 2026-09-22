import { ChevronDown } from "lucide-react";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { ajuste } from "@/lib/settings";
import type { Faq, Settings } from "@/lib/types";

export function SeccionPreguntas({
  preguntas,
  ajustes,
}: {
  preguntas: Faq[];
  ajustes: Settings;
}) {
  if (preguntas.length === 0) return null;

  return (
    <section className="bg-crema-claro py-16 lg:py-24">
      <div className="contenedor max-w-3xl">
        <EncabezadoSeccion
          titulo={ajuste(ajustes, "faq_titulo")}
          tituloCursiva={ajuste(ajustes, "faq_titulo_cursiva")}
          centrado
        />

        <div className="mt-10 divide-y divide-arena/30 border-y border-arena/30">
          {preguntas.map((pregunta) => (
            <details key={pregunta.id} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left">
                <span className="font-display text-lg text-marron">
                  {pregunta.question}
                </span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-terracota transition-transform duration-300 group-open:rotate-180"
                  strokeWidth={1.5}
                />
              </summary>
              <p className="pb-5 pr-10 text-sm leading-relaxed text-carbon/70">
                {pregunta.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
