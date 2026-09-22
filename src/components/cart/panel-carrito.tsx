"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";

import { useCarrito } from "@/components/cart/carrito";
import { estilosBoton } from "@/components/ui/boton";
import { PlaceholderImagen } from "@/components/ui/marca";
import { formatARS } from "@/lib/utils";

/** Cajon lateral del carrito. Se abre al agregar algo o desde la cabecera. */
export function PanelCarrito() {
  const { items, panelAbierto, cerrarPanel, cambiarCantidad, quitar, subtotal, ahorro } =
    useCarrito();

  useEffect(() => {
    function alApretar(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarPanel();
    }
    if (panelAbierto) {
      document.addEventListener("keydown", alApretar);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", alApretar);
      document.body.style.overflow = "";
    };
  }, [panelAbierto, cerrarPanel]);

  return (
    <>
      <div
        onClick={cerrarPanel}
        className={`fixed inset-0 z-50 bg-carbon/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          panelAbierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        aria-label="Tu pedido"
        aria-hidden={!panelAbierto}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-crema-claro shadow-tarjeta transition-transform duration-300 ${
          panelAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-arena/30 px-5 py-4">
          <h2 className="font-display text-xl text-marron">Tu pedido</h2>
          <button
            onClick={cerrarPanel}
            className="rounded-marca p-1.5 text-arena transition-colors hover:bg-beige/40 hover:text-marron"
            aria-label="Cerrar el carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-arena/60" strokeWidth={1.2} />
            <p className="text-sm text-arena">Todavía no agregaste nada.</p>
            <Link
              href="/tienda"
              onClick={cerrarPanel}
              className={estilosBoton("secundario", "sm")}
            >
              Ver la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-arena/20 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.clave} className="flex gap-3 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-marca bg-beige/40">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderImagen texto={item.nombre} />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-base leading-snug text-marron">
                          {item.nombre}
                        </p>
                        {item.unidad ? (
                          <p className="text-xs text-arena">{item.unidad}</p>
                        ) : null}
                      </div>
                      <button
                        onClick={() => quitar(item.clave)}
                        className="p-1 text-arena transition-colors hover:text-terracota"
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-marca border border-arena/40">
                        <button
                          onClick={() => cambiarCantidad(item.clave, item.cantidad - 1)}
                          className="px-2 py-1.5 text-marron transition-colors hover:bg-beige/40"
                          aria-label="Quitar uno"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => cambiarCantidad(item.clave, item.cantidad + 1)}
                          className="px-2 py-1.5 text-marron transition-colors hover:bg-beige/40"
                          aria-label="Agregar uno"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.precioLista > item.precio ? (
                          <p className="text-xs text-arena line-through">
                            {formatARS(item.precioLista * item.cantidad)}
                          </p>
                        ) : null}
                        <p className="font-semibold text-marron">
                          {formatARS(item.precio * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-arena/30 bg-white px-5 py-4">
              {ahorro > 0 ? (
                <p className="mb-2 flex items-center justify-between text-sm text-oliva">
                  <span>Estás ahorrando</span>
                  <span className="font-semibold">{formatARS(ahorro)}</span>
                </p>
              ) : null}
              <p className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-[0.1em] text-arena">
                  Subtotal
                </span>
                <span className="font-display text-2xl text-marron">
                  {formatARS(subtotal)}
                </span>
              </p>
              <p className="mt-1 text-xs text-arena">
                El envío se calcula en el paso siguiente.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={cerrarPanel}
                  className={estilosBoton("primario", "md", "w-full")}
                >
                  Finalizar pedido
                </Link>
                <Link
                  href="/carrito"
                  onClick={cerrarPanel}
                  className={estilosBoton("fantasma", "sm", "w-full")}
                >
                  Ver el carrito completo
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
