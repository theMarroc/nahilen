import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const BASE_CAMPO =
  "w-full rounded-marca border border-arena/45 bg-white px-3.5 py-2.5 text-sm text-carbon " +
  "placeholder:text-arena/80 transition-colors focus:border-terracota focus:outline-none " +
  "disabled:bg-crema disabled:text-carbon/50";

export function Etiqueta({
  children,
  htmlFor,
  requerido,
  ayuda,
}: {
  children: ReactNode;
  htmlFor?: string;
  requerido?: boolean;
  ayuda?: string;
}) {
  return (
    <span className="mb-1.5 flex flex-col gap-0.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-marron"
      >
        {children}
        {requerido ? <span className="ml-1 text-terracota">*</span> : null}
      </label>
      {ayuda ? <span className="text-xs text-arena">{ayuda}</span> : null}
    </span>
  );
}

export function Campo({
  className,
  ...resto
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(BASE_CAMPO, className)} {...resto} />;
}

export function AreaTexto({
  className,
  ...resto
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(BASE_CAMPO, "min-h-24 resize-y", className)} {...resto} />;
}

export function Selector({
  className,
  children,
  ...resto
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(BASE_CAMPO, "appearance-none pr-8", className)} {...resto}>
      {children}
    </select>
  );
}

/** Campo con etiqueta arriba, el patron que usa todo el panel. */
export function CampoConEtiqueta({
  etiqueta,
  requerido,
  ayuda,
  children,
  className,
}: {
  etiqueta: string;
  requerido?: boolean;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <Etiqueta requerido={requerido} ayuda={ayuda}>
        {etiqueta}
      </Etiqueta>
      {children}
    </div>
  );
}

export function Insignia({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Tarjeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-marca border border-arena/30 bg-white p-5 shadow-suave",
        className,
      )}
    >
      {children}
    </div>
  );
}
