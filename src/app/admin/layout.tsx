import Link from "next/link";

import { NavegacionAdmin } from "@/components/admin/navegacion";
import { Logo } from "@/components/ui/marca";
import { exigirAdminORedirigir } from "@/lib/auth";
import { supabaseConfigurado } from "@/lib/supabase/server";

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigurado()) return <PantallaSinConfigurar />;

  const perfil = await exigirAdminORedirigir();

  return (
    <div className="min-h-dvh bg-crema-claro lg:grid lg:grid-cols-[16rem_1fr]">
      <NavegacionAdmin nombre={perfil.full_name ?? "Administradora"} />
      <div className="min-w-0">
        <div className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-10 lg:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Guía corta para cuando el proyecto todavía no tiene Supabase. */
function PantallaSinConfigurar() {
  const pasos = [
    'Creá una cuenta gratis en supabase.com y un proyecto nuevo (región "South America").',
    "En el proyecto, abrí SQL Editor › New query, pegá todo el archivo supabase/schema.sql y apretá Run.",
    "Andá a Project Settings › API y copiá la Project URL, la clave anon y la clave service_role.",
    "Pegá esas tres claves en el archivo .env.local (podés partir de .env.example).",
    "En Authentication › Users creá el usuario de tu prima con email y contraseña.",
    "Volvé al SQL Editor y corré la última línea del schema.sql para darle permisos de administradora.",
    "Reiniciá el servidor (npm run dev) y volvé a esta pantalla.",
  ];

  return (
    <div className="min-h-dvh bg-crema-claro">
      <div className="mx-auto max-w-2xl px-5 py-16">
        <Logo />

        <h1 className="titulo-seccion mt-8 text-marron">
          Falta conectar la <span className="italic text-terracota">base de datos</span>
        </h1>
        <span className="linea-decorativa mt-5" />

        <p className="mt-6 text-sm leading-relaxed text-carbon/75">
          El panel de administración necesita Supabase para guardar los productos, los
          pedidos y las imágenes. Son unos minutos y es gratis.
        </p>

        <ol className="mt-8 flex flex-col gap-4">
          {pasos.map((paso, indice) => (
            <li
              key={paso}
              className="flex gap-4 rounded-marca border border-arena/30 bg-white p-4 shadow-suave"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mostaza text-xs font-bold text-carbon">
                {indice + 1}
              </span>
              <p className="text-sm leading-relaxed text-carbon/80">{paso}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm text-arena">
          Los pasos completos, con el detalle de qué copiar, están en el archivo{" "}
          <code className="rounded bg-crema px-1.5 py-0.5 font-mono text-xs">
            README.md
          </code>{" "}
          del proyecto.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-terracota hover:underline"
        >
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}
