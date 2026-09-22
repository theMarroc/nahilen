"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

import { useCarrito } from "@/components/cart/carrito";
import { Logo } from "@/components/ui/marca";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/tienda", texto: "Tienda" },
  { href: "/combos", texto: "Combos" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/contacto", texto: "Contacto" },
];

export function Cabecera({
  nombreMarca,
  hayUsuario,
  esAdmin,
  aviso,
}: {
  nombreMarca: string;
  hayUsuario: boolean;
  esAdmin: boolean;
  aviso?: string | null;
}) {
  const ruta = usePathname();
  const { cantidadTotal, abrirPanel } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(ruta);

  // Al cambiar de página se cierran el menú y el buscador.
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta);
    setMenuAbierto(false);
    setBuscadorAbierto(false);
  }

  const activo = (href: string) =>
    href === "/" ? ruta === "/" : ruta.startsWith(href);

  return (
    <>
      {aviso ? (
        <div className="bg-mostaza px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-carbon">
          {aviso}
        </div>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-arena/25 bg-crema/95 backdrop-blur-sm">
        <div className="contenedor flex h-18 items-center justify-between gap-4 py-3">
          <Link href="/" aria-label={`${nombreMarca} — inicio`}>
            <Logo nombre={nombreMarca} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
            {ENLACES.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={cn(
                  "relative py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  activo(enlace.href)
                    ? "text-carbon"
                    : "text-carbon/60 hover:text-carbon",
                )}
              >
                {enlace.texto}
                {activo(enlace.href) ? (
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-mostaza" />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setBuscadorAbierto((v) => !v)}
              className="rounded-marca p-2 text-carbon/70 transition-colors hover:bg-beige/40 hover:text-carbon"
              aria-label="Buscar productos"
              aria-expanded={buscadorAbierto}
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <Link
              href={hayUsuario ? "/mi-cuenta" : "/ingresar"}
              className="rounded-marca p-2 text-carbon/70 transition-colors hover:bg-beige/40 hover:text-carbon"
              aria-label={hayUsuario ? "Mi cuenta" : "Ingresar"}
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <button
              onClick={abrirPanel}
              className="relative rounded-marca p-2 text-carbon/70 transition-colors hover:bg-beige/40 hover:text-carbon"
              aria-label={`Ver el pedido (${cantidadTotal} productos)`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {cantidadTotal > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-bold text-white">
                  {cantidadTotal}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="rounded-marca p-2 text-carbon/70 transition-colors hover:bg-beige/40 hover:text-carbon lg:hidden"
              aria-label="Abrir el menú"
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {buscadorAbierto ? (
          <div className="border-t border-arena/25 bg-crema-claro">
            <form action="/tienda" className="contenedor flex gap-2 py-3">
              <input
                name="q"
                autoFocus
                placeholder="Buscar mermeladas, budines..."
                className="w-full rounded-marca border border-arena/45 bg-white px-3.5 py-2.5 text-sm placeholder:text-arena/80 focus:border-terracota focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-marca bg-carbon px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-crema"
              >
                Buscar
              </button>
            </form>
          </div>
        ) : null}

        {menuAbierto ? (
          <nav
            className="border-t border-arena/25 bg-crema-claro lg:hidden"
            aria-label="Principal (móvil)"
          >
            <ul className="contenedor flex flex-col py-2">
              {ENLACES.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className={cn(
                      "block border-b border-arena/15 py-3 text-sm font-semibold uppercase tracking-[0.1em]",
                      activo(enlace.href) ? "text-terracota" : "text-carbon/75",
                    )}
                  >
                    {enlace.texto}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={hayUsuario ? "/mi-cuenta" : "/ingresar"}
                  className="block py-3 text-sm font-semibold uppercase tracking-[0.1em] text-carbon/75"
                >
                  {hayUsuario ? "Mi cuenta" : "Ingresar"}
                </Link>
              </li>
              {esAdmin ? (
                <li>
                  <Link
                    href="/admin"
                    className="block py-3 text-sm font-semibold uppercase tracking-[0.1em] text-terracota"
                  >
                    Panel de administración
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}
      </header>

      {esAdmin ? (
        <Link
          href="/admin"
          className="block bg-carbon px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-mostaza transition-colors hover:bg-carbon/90"
        >
          Estás viendo el sitio como administradora — ir al panel
        </Link>
      ) : null}
    </>
  );
}
