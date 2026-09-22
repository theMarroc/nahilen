"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Tag,
  ToggleLeft,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

import { salir } from "@/actions/auth";
import { Logo } from "@/components/ui/marca";
import { cn } from "@/lib/utils";

const SECCIONES = [
  {
    titulo: "Ventas",
    enlaces: [
      { href: "/admin", texto: "Resumen", Icono: LayoutDashboard },
      { href: "/admin/pedidos", texto: "Pedidos", Icono: ShoppingBag },
    ],
  },
  {
    titulo: "Catálogo",
    enlaces: [
      { href: "/admin/productos", texto: "Productos", Icono: Package },
      { href: "/admin/categorias", texto: "Categorías", Icono: Tag },
      { href: "/admin/combos", texto: "Combos", Icono: Package },
    ],
  },
  {
    titulo: "Precios",
    enlaces: [
      { href: "/admin/ofertas", texto: "Ofertas", Icono: Percent },
      { href: "/admin/precios", texto: "Aumentar precios", Icono: TrendingUp },
    ],
  },
  {
    titulo: "El sitio",
    enlaces: [
      { href: "/admin/secciones", texto: "Secciones", Icono: ToggleLeft },
      { href: "/admin/contenido", texto: "Textos y fotos", Icono: FileText },
      { href: "/admin/ajustes", texto: "Ajustes", Icono: Settings },
    ],
  },
];

export function NavegacionAdmin({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  const activo = (href: string) =>
    href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);

  const contenido = (
    <>
      <div className="flex flex-col gap-6">
        {SECCIONES.map((seccion) => (
          <div key={seccion.titulo}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-arena">
              {seccion.titulo}
            </p>
            <ul className="flex flex-col gap-0.5">
              {seccion.enlaces.map(({ href, texto, Icono }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setAbierto(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-marca px-3 py-2 text-sm transition-colors",
                      activo(href)
                        ? "bg-carbon text-crema"
                        : "text-carbon/75 hover:bg-beige/50 hover:text-carbon",
                    )}
                  >
                    <Icono className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-arena/30 pt-4">
        <p className="px-3 text-xs text-arena">Ingresaste como</p>
        <p className="mb-3 truncate px-3 text-sm font-semibold text-marron">{nombre}</p>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-marca px-3 py-2 text-sm text-carbon/75 transition-colors hover:bg-beige/50 hover:text-carbon"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          Ver el sitio
        </Link>

        <form action={salir}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-marca px-3 py-2 text-sm text-carbon/75 transition-colors hover:bg-terracota/10 hover:text-terracota"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior en celular */}
      <div className="flex items-center justify-between border-b border-arena/25 bg-crema px-4 py-3 lg:hidden">
        <Link href="/admin">
          <Logo />
        </Link>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="rounded-marca p-2 text-carbon/70 hover:bg-beige/40"
          aria-label="Abrir el menú del panel"
          aria-expanded={abierto}
        >
          {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {abierto ? (
        <nav className="border-b border-arena/25 bg-crema px-3 py-4 lg:hidden">
          {contenido}
        </nav>
      ) : null}

      {/* Barra lateral en escritorio */}
      <nav className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-arena/25 bg-crema px-3 py-6 lg:flex">
        <Link href="/admin" className="mb-8 px-3">
          <Logo />
          <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-arena">
            Panel
          </span>
        </Link>
        {contenido}
      </nav>
    </>
  );
}
