import { Isotipo } from "@/components/ui/marca";
import { ajuste } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export function FranjaFrase({ ajustes }: { ajustes: Settings }) {
  const frase = ajuste(ajustes, "frase_destacada");
  if (!frase) return null;

  return (
    <section className="relative overflow-hidden bg-mostaza py-14">
      <Isotipo className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rotate-12 text-white/25" />
      <Isotipo className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 -rotate-12 text-white/20" />

      <div className="contenedor relative text-center">
        <p className="font-display text-[clamp(1.5rem,1.1rem+1.8vw,2.5rem)] italic leading-tight text-carbon">
          &ldquo;{frase}&rdquo;
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-carbon/70">
          {ajuste(ajustes, "marca_nombre")}
        </p>
      </div>
    </section>
  );
}
