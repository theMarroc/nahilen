"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Boton } from "@/components/ui/boton";
import { Selector } from "@/components/ui/campos";
import { formatARS } from "@/lib/utils";

export type OpcionProducto = { id: string; name: string; price: number };
export type ItemCombo = { product_id: string; quantity: number };

export function EditorItemsCombo({
  productos,
  iniciales = [],
}: {
  productos: OpcionProducto[];
  iniciales?: ItemCombo[];
}) {
  const [items, setItems] = useState<ItemCombo[]>(iniciales);
  const [elegido, setElegido] = useState(productos[0]?.id ?? "");

  const buscar = (id: string) => productos.find((p) => p.id === id);

  const totalSuelto = items.reduce((acumulado, item) => {
    const producto = buscar(item.product_id);
    return acumulado + (producto ? producto.price * item.quantity : 0);
  }, 0);

  function agregar() {
    if (!elegido) return;
    setItems((actuales) =>
      actuales.some((i) => i.product_id === elegido)
        ? actuales.map((i) =>
            i.product_id === elegido ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...actuales, { product_id: elegido, quantity: 1 }],
    );
  }

  function cambiar(id: string, cantidad: number) {
    setItems((actuales) =>
      cantidad <= 0
        ? actuales.filter((i) => i.product_id !== id)
        : actuales.map((i) =>
            i.product_id === id ? { ...i, quantity: cantidad } : i,
          ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {items.length > 0 ? (
        <ul className="divide-y divide-arena/20 rounded-marca border border-arena/30">
          {items.map((item) => {
            const producto = buscar(item.product_id);
            return (
              <li
                key={item.product_id}
                className="flex flex-wrap items-center gap-3 px-3 py-2.5"
              >
                <span className="min-w-32 flex-1 text-sm text-carbon/85">
                  {producto?.name ?? "Producto borrado"}
                  {producto ? (
                    <span className="ml-2 text-xs text-arena">
                      {formatARS(producto.price)} c/u
                    </span>
                  ) : null}
                </span>

                <div className="flex items-center rounded-marca border border-arena/40">
                  <button
                    type="button"
                    onClick={() => cambiar(item.product_id, item.quantity - 1)}
                    className="px-2 py-1.5 text-marron transition-colors hover:bg-beige/40"
                    aria-label="Quitar uno"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => cambiar(item.product_id, item.quantity + 1)}
                    className="px-2 py-1.5 text-marron transition-colors hover:bg-beige/40"
                    aria-label="Agregar uno"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => cambiar(item.product_id, 0)}
                  className="rounded-marca p-1.5 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                  aria-label="Quitar del combo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-marca border border-dashed border-arena/50 bg-crema/60 px-4 py-6 text-center text-sm text-arena">
          Elegí los productos que lleva el combo.
        </p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1">
          <Selector value={elegido} onChange={(e) => setElegido(e.target.value)}>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.name} — {formatARS(producto.price)}
              </option>
            ))}
          </Selector>
        </div>
        <Boton type="button" variante="secundario" tamano="sm" onClick={agregar}>
          <Plus className="h-4 w-4" />
          Agregar
        </Boton>
      </div>

      {items.length > 0 ? (
        <p className="rounded-marca bg-crema px-4 py-2.5 text-sm text-carbon/75">
          Comprado por separado saldría{" "}
          <strong className="font-semibold text-marron">
            {formatARS(totalSuelto)}
          </strong>
          . Poné un precio menor para que el combo convenga.
        </p>
      ) : null}
    </div>
  );
}
