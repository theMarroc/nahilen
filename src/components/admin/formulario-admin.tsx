"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { Boton, type TamanoBoton, type VarianteBoton } from "@/components/ui/boton";
import type { EstadoAdmin } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Envoltorio para los formularios del panel.
 * Se encarga del estado (guardando / guardado / error) para que las páginas
 * puedan seguir siendo Server Components.
 */
export function FormularioAdmin({
  accion,
  children,
  textoBoton = "Guardar cambios",
  textoGuardando = "Guardando...",
  variante = "primario",
  tamano = "md",
  className,
  claseBoton,
  extraBoton,
}: {
  accion: (anterior: EstadoAdmin, datos: FormData) => Promise<EstadoAdmin>;
  children: ReactNode;
  textoBoton?: string;
  textoGuardando?: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  className?: string;
  claseBoton?: string;
  extraBoton?: ReactNode;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoAdmin, FormData>(
    accion,
    null,
  );

  return (
    <form action={enviar} className={className}>
      {children}

      {estado ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-4 flex items-start gap-2 rounded-marca px-3 py-2.5 text-xs leading-relaxed",
            estado.ok
              ? "border border-oliva/40 bg-oliva/10 text-oliva"
              : "border border-terracota/40 bg-terracota/10 text-terracota-oscuro",
          )}
        >
          {estado.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          )}
          {estado.mensaje}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Boton
          type="submit"
          variante={variante}
          tamano={tamano}
          disabled={pendiente}
          className={claseBoton}
        >
          {pendiente ? textoGuardando : textoBoton}
        </Boton>
        {extraBoton}
      </div>
    </form>
  );
}
