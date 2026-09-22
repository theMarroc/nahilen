import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Ornamento } from "@/components/ui/marca";

export function CabeceraPagina({
  titulo,
  tituloCursiva,
  texto,
  migas,
}: {
  titulo: string;
  tituloCursiva?: string;
  texto?: string;
  migas?: { href: string; texto: string }[];
}) {
  return (
    <section className="border-b border-arena/25 bg-crema py-12 lg:py-16">
      <div className="contenedor flex flex-col items-center text-center">
        {migas && migas.length > 0 ? (
          <nav
            aria-label="Ubicación"
            className="mb-5 flex flex-wrap items-center justify-center gap-1 text-[11px] uppercase tracking-[0.12em] text-arena"
          >
            <Link href="/" className="transition-colors hover:text-marron">
              Inicio
            </Link>
            {migas.map((miga) => (
              <span key={miga.href} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <Link href={miga.href} className="transition-colors hover:text-marron">
                  {miga.texto}
                </Link>
              </span>
            ))}
          </nav>
        ) : null}

        <h1 className="titulo-seccion text-marron">
          {titulo}
          {tituloCursiva ? (
            <>
              {" "}
              <span className="italic text-terracota">{tituloCursiva}</span>
            </>
          ) : null}
        </h1>

        <Ornamento className="mt-5" />

        {texto ? (
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-carbon/70">{texto}</p>
        ) : null}
      </div>
    </section>
  );
}
