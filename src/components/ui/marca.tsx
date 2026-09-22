import { cn } from "@/lib/utils";

/** Isotipo: la ramita de la marca. */
export function Isotipo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7 text-mostaza", className)}
    >
      <path
        d="M16 29V13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M16 14c-5.2 0-9-3.2-9-8 4.9 0 9 2.8 9 8Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M16 19c-4.2 0-7.4-2.6-7.4-6.6 4 0 7.4 2.3 7.4 6.6Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M16 12c4.2 0 7.4-2.6 7.4-6.6-4 0-7.4 2.3-7.4 6.6Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M16 18c3.5 0 6.2-2.2 6.2-5.6-3.4 0-6.2 2-6.2 5.6Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function Logo({
  nombre = "Nahilén",
  className,
  claseTexto,
}: {
  nombre?: string;
  className?: string;
  claseTexto?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Isotipo />
      <span
        className={cn(
          "font-display text-2xl leading-none tracking-tight text-marron",
          claseTexto,
        )}
      >
        {nombre}
      </span>
    </span>
  );
}

/** Ornamento: ramita centrada con dos lineas, como en la guia de marca. */
export function Ornamento({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-10 bg-arena/50" />
      <Isotipo className="h-4 w-4 text-arena" />
      <span className="h-px w-10 bg-arena/50" />
    </span>
  );
}

const ICONOS_BENEFICIO: Record<string, React.ReactNode> = {
  corazon: (
    <>
      <path d="M12 20s-6.5-4.2-6.5-8.6A3.6 3.6 0 0 1 12 9.1a3.6 3.6 0 0 1 6.5 2.3C18.5 15.8 12 20 12 20Z" />
      <path d="M12 9.1V6" />
    </>
  ),
  caja: (
    <>
      <path d="M4 8.5 12 5l8 3.5v7L12 19l-8-3.5v-7Z" />
      <path d="M4 8.5 12 12l8-3.5M12 12v7" />
    </>
  ),
  hoja: (
    <>
      <path d="M12 20V11" />
      <path d="M12 12c-4.4 0-7.5-2.7-7.5-6.8 4.1 0 7.5 2.4 7.5 6.8Z" />
      <path d="M12 14c4 0 6.8-2.4 6.8-6.2-3.7 0-6.8 2.2-6.8 6.2Z" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="9.5" r="3" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </>
  ),
  estrella: (
    <>
      <path d="m12 5 2.1 4.6 5 .6-3.7 3.4 1 4.9L12 16.1l-4.4 2.4 1-4.9L4.9 10.2l5-.6L12 5Z" />
    </>
  ),
};

export const NOMBRES_ICONO = Object.keys(ICONOS_BENEFICIO);

export function IconoBeneficio({
  nombre,
  className,
}: {
  nombre: string;
  className?: string;
}) {
  const trazo = ICONOS_BENEFICIO[nombre] ?? ICONOS_BENEFICIO.hoja;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-9 w-9 text-mostaza-oscuro", className)}
    >
      <circle cx="12" cy="12" r="11" strokeOpacity="0.28" strokeWidth="1" />
      {trazo}
    </svg>
  );
}

/**
 * Relleno decorativo para cuando un producto todavía no tiene foto.
 * Usa un degrade determinista segun el nombre, asi la grilla no queda plana.
 */
export function PlaceholderImagen({
  texto,
  className,
}: {
  texto: string;
  className?: string;
}) {
  const paletas = [
    ["#F2E9DE", "#E0C9A6"],
    ["#E0C9A6", "#C97A4E"],
    ["#F2E9DE", "#A88D74"],
    ["#E0C9A6", "#E1B43C"],
    ["#F2E9DE", "#7A8A5A"],
  ];
  let suma = 0;
  for (let i = 0; i < texto.length; i += 1) suma += texto.charCodeAt(i);
  const [desde, hasta] = paletas[suma % paletas.length];

  return (
    <div
      className={cn("relative flex h-full w-full items-center justify-center", className)}
      style={{ background: `linear-gradient(140deg, ${desde} 0%, ${hasta} 100%)` }}
      aria-hidden="true"
    >
      <Isotipo className="h-10 w-10 text-white/70" />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Iconos de redes. Los dibujamos nosotros porque lucide-react ya no incluye
   iconos de marcas.
   -------------------------------------------------------------------------- */

export function IconoInstagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoFacebook({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path d="M14.5 8.5h2.2V5.6h-2.4c-2.2 0-3.6 1.4-3.6 3.6v1.6H8.9v2.9h1.8V21h3v-7.3h2.2l.4-2.9h-2.6V9.4c0-.6.3-.9.8-.9Z" />
    </svg>
  );
}

export function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path d="M12 3a8.7 8.7 0 0 0-7.4 13.3L3.5 21l4.8-1.1A8.7 8.7 0 1 0 12 3Z" />
      <path d="M9 9.3c0 2.6 2.1 4.7 4.7 4.7.5 0 .9-.4.9-.9v-.6l-1.6-.6-.7.8a4.2 4.2 0 0 1-1.9-1.9l.8-.7-.6-1.6h-.7c-.5 0-.9.4-.9.8Z" />
    </svg>
  );
}
