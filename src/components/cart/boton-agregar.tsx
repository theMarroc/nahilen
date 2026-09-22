"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCarrito, type NuevoItem } from "@/components/cart/carrito";
import { Boton, estilosBoton, type TamanoBoton, type VarianteBoton } from "@/components/ui/boton";

export function BotonAgregar({
  item,
  variante = "primario",
  tamano = "md",
  className,
  etiqueta = "Agregar al pedido",
  agotado = false,
}: {
  item: NuevoItem;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  className?: string;
  etiqueta?: string;
  agotado?: boolean;
}) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  if (agotado) {
    return (
      <span className={estilosBoton("secundario", tamano, `${className ?? ""} opacity-60`)}>
        Sin stock
      </span>
    );
  }

  return (
    <Boton
      variante={variante}
      tamano={tamano}
      className={className}
      onClick={() => {
        agregar(item);
        setAgregado(true);
        window.setTimeout(() => setAgregado(false), 1400);
      }}
    >
      {agregado ? (
        <>
          <Check className="h-4 w-4" /> Agregado
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> {etiqueta}
        </>
      )}
    </Boton>
  );
}

/** Versión con selector de cantidad, para la página de producto. */
export function AgregarConCantidad({
  item,
  agotado = false,
  stockMaximo,
}: {
  item: NuevoItem;
  agotado?: boolean;
  stockMaximo?: number;
}) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const tope = stockMaximo && stockMaximo > 0 ? stockMaximo : 99;

  if (agotado) {
    return (
      <div className="rounded-marca border border-arena/40 bg-beige/30 px-4 py-3 text-sm text-marron">
        Este producto no tiene stock en este momento. Escribinos por WhatsApp y te
        avisamos cuando vuelve.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-marca border border-arena/40 bg-white">
        <button
          onClick={() => setCantidad((c) => Math.max(1, c - 1))}
          className="px-3 py-3 text-marron transition-colors hover:bg-beige/40"
          aria-label="Quitar uno"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-semibold tabular-nums">{cantidad}</span>
        <button
          onClick={() => setCantidad((c) => Math.min(tope, c + 1))}
          className="px-3 py-3 text-marron transition-colors hover:bg-beige/40"
          aria-label="Agregar uno"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Boton
        tamano="lg"
        className="flex-1"
        onClick={() => {
          agregar(item, cantidad);
          setAgregado(true);
          window.setTimeout(() => setAgregado(false), 1600);
        }}
      >
        {agregado ? (
          <>
            <Check className="h-4 w-4" /> Agregado al pedido
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Agregar al pedido
          </>
        )}
      </Boton>
    </div>
  );
}
