"use client";

import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { aplicarAumento } from "@/actions/admin/precios";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import type { EstadoAdmin } from "@/lib/types";
import { cn, formatARS, redondear } from "@/lib/utils";

export type ProductoPrecio = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
};

const REDONDEOS = [
  { valor: "1", texto: "Sin redondear" },
  { valor: "10", texto: "A los $10" },
  { valor: "50", texto: "A los $50" },
  { valor: "100", texto: "A los $100" },
  { valor: "500", texto: "A los $500" },
] as const;

export function FormularioAumento({
  productos,
  categorias,
}: {
  productos: ProductoPrecio[];
  categorias: { id: string; name: string }[];
}) {
  const [porcentaje, setPorcentaje] = useState("10");
  const [alcance, setAlcance] = useState<"todos" | "categoria">("todos");
  const [categoria, setCategoria] = useState(categorias[0]?.id ?? "");
  const [redondeo, setRedondeo] = useState<"1" | "10" | "50" | "100" | "500">("50");

  const [estado, enviar, pendiente] = useActionState<EstadoAdmin, FormData>(
    aplicarAumento,
    null,
  );

  // La vista previa se calcula en el navegador con la misma fórmula que usa
  // el servidor, así lo que se ve acá es lo que se va a guardar.
  const vistaPrevia = useMemo(() => {
    const numero = Number(porcentaje);
    if (!Number.isFinite(numero)) return [];

    return productos
      .filter((p) => alcance === "todos" || p.category_id === categoria)
      .map((producto) => ({
        ...producto,
        nuevo: Math.max(0, redondear(producto.price * (1 + numero / 100), redondeo)),
      }));
  }, [productos, porcentaje, alcance, categoria, redondeo]);

  const cambian = vistaPrevia.filter((p) => p.nuevo !== p.price);

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoConEtiqueta
          etiqueta="Porcentaje"
          requerido
          ayuda="Positivo aumenta, negativo baja. Ej: 12 o -5"
        >
          <Campo
            name="porcentaje"
            type="number"
            step={0.5}
            required
            inputMode="decimal"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
          />
        </CampoConEtiqueta>

        <CampoConEtiqueta etiqueta="Redondear" ayuda="Para que queden precios prolijos">
          <Selector
            name="redondeo"
            value={redondeo}
            onChange={(e) => setRedondeo(e.target.value as typeof redondeo)}
          >
            {REDONDEOS.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </Selector>
        </CampoConEtiqueta>

        <CampoConEtiqueta etiqueta="Aplicar a">
          <Selector
            name="alcance"
            value={alcance}
            onChange={(e) => setAlcance(e.target.value as typeof alcance)}
          >
            <option value="todos">Todos los productos</option>
            <option value="categoria">Una categoría</option>
          </Selector>
        </CampoConEtiqueta>

        {alcance === "categoria" ? (
          <CampoConEtiqueta etiqueta="Categoría" requerido>
            <Selector
              name="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Selector>
          </CampoConEtiqueta>
        ) : null}

        <CampoConEtiqueta
          etiqueta="Motivo"
          ayuda="Opcional, queda en el historial"
          className="sm:col-span-2"
        >
          <Campo name="motivo" maxLength={120} placeholder="Aumento de la fruta, junio" />
        </CampoConEtiqueta>
      </div>

      <div className="rounded-marca border border-arena/30 bg-crema/50">
        <p className="border-b border-arena/25 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-marron">
          Vista previa — {cambian.length}{" "}
          {cambian.length === 1 ? "precio cambia" : "precios cambian"}
        </p>

        {cambian.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-arena">
            Con esos valores no cambia ningún precio.
          </p>
        ) : (
          <ul className="max-h-64 divide-y divide-arena/15 overflow-y-auto">
            {cambian.map((producto) => (
              <li
                key={producto.id}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-carbon/80">{producto.name}</span>
                <span className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="text-arena line-through">
                    {formatARS(producto.price)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-arena" />
                  <span className="font-semibold text-marron">
                    {formatARS(producto.nuevo)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {estado ? (
        <p
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-marca px-3 py-2.5 text-xs leading-relaxed",
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

      <Boton
        type="submit"
        tamano="lg"
        disabled={pendiente || cambian.length === 0}
        className="self-start"
      >
        {pendiente
          ? "Aplicando..."
          : `Aplicar a ${cambian.length} ${cambian.length === 1 ? "producto" : "productos"}`}
      </Boton>

      <p className="text-xs leading-relaxed text-arena">
        Después de aplicarlo podés deshacerlo desde el historial de abajo.
      </p>
    </form>
  );
}
