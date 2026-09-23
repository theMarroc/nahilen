"use client";

import type { ReactNode } from "react";

/**
 * Formulario que pide confirmación antes de ejecutar su Server Action.
 *
 * Si la persona cancela, el `preventDefault()` del submit hace que React no
 * dispare la acción (React chequea `defaultPrevented` antes de llamarla).
 */
export function FormularioConfirmado({
  accion,
  mensaje,
  children,
  className,
}: {
  accion: (datos: FormData) => Promise<void>;
  mensaje: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={accion}
      className={className}
      onSubmit={(evento) => {
        if (!window.confirm(mensaje)) evento.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
