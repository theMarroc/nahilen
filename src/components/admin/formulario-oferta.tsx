"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useActionState, useState } from "react";

import { guardarOferta } from "@/actions/admin/ofertas";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import type { EstadoAdmin, Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

type Opcion = { id: string; name: string };

/** Fecha en el formato que espera <input type="datetime-local">. */
function paraInput(iso: string | null) {
  if (!iso) return "";
  const fecha = new Date(iso);
  const desplazada = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return desplazada.toISOString().slice(0, 16);
}

export function FormularioOferta({
  oferta,
  categorias,
  productos,
}: {
  oferta: Offer | null;
  categorias: Opcion[];
  productos: Opcion[];
}) {
  const [alcance, setAlcance] = useState(oferta?.scope ?? "all");
  const [tipo, setTipo] = useState(oferta?.kind ?? "percent");

  const [estado, enviar, pendiente] = useActionState<EstadoAdmin, FormData>(
    guardarOferta,
    null,
  );

  return (
    <form action={enviar} className="flex flex-col gap-4">
      {oferta ? <input type="hidden" name="id" value={oferta.id} /> : null}

      <CampoConEtiqueta etiqueta="Nombre de la oferta" requerido ayuda="Solo lo ves vos">
        <Campo
          name="name"
          required
          defaultValue={oferta?.name ?? ""}
          placeholder="15% en budines"
        />
      </CampoConEtiqueta>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoConEtiqueta etiqueta="Tipo de descuento">
          <Selector
            name="kind"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "percent" | "amount")}
          >
            <option value="percent">Porcentaje (%)</option>
            <option value="amount">Monto fijo ($)</option>
          </Selector>
        </CampoConEtiqueta>

        <CampoConEtiqueta
          etiqueta={tipo === "percent" ? "Porcentaje" : "Monto a descontar"}
          requerido
          ayuda={tipo === "percent" ? "Por ejemplo 15" : "Por ejemplo 500"}
        >
          <Campo
            name="value"
            type="number"
            min={0}
            step={tipo === "percent" ? 1 : 10}
            max={tipo === "percent" ? 100 : undefined}
            required
            inputMode="numeric"
            defaultValue={oferta ? String(oferta.value) : ""}
          />
        </CampoConEtiqueta>
      </div>

      <CampoConEtiqueta etiqueta="Se aplica a">
        <Selector
          name="scope"
          value={alcance}
          onChange={(e) => setAlcance(e.target.value as typeof alcance)}
        >
          <option value="all">Toda la tienda</option>
          <option value="category">Una categoría</option>
          <option value="product">Un producto</option>
        </Selector>
      </CampoConEtiqueta>

      {alcance === "category" ? (
        <CampoConEtiqueta etiqueta="Categoría" requerido>
          <Selector name="category_id" defaultValue={oferta?.category_id ?? ""}>
            <option value="">Elegí una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </Selector>
        </CampoConEtiqueta>
      ) : null}

      {alcance === "product" ? (
        <CampoConEtiqueta etiqueta="Producto" requerido>
          <Selector name="product_id" defaultValue={oferta?.product_id ?? ""}>
            <option value="">Elegí un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.name}
              </option>
            ))}
          </Selector>
        </CampoConEtiqueta>
      ) : null}

      <CampoConEtiqueta
        etiqueta="Texto del cartelito"
        ayuda="Si lo dejás vacío se muestra el porcentaje automáticamente"
      >
        <Campo
          name="label"
          maxLength={30}
          defaultValue={oferta?.label ?? ""}
          placeholder="2x1, LIQUIDACIÓN, 15% OFF..."
        />
      </CampoConEtiqueta>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoConEtiqueta etiqueta="Desde" ayuda="Opcional">
          <Campo
            name="starts_at"
            type="datetime-local"
            defaultValue={paraInput(oferta?.starts_at ?? null)}
          />
        </CampoConEtiqueta>

        <CampoConEtiqueta etiqueta="Hasta" ayuda="Opcional">
          <Campo
            name="ends_at"
            type="datetime-local"
            defaultValue={paraInput(oferta?.ends_at ?? null)}
          />
        </CampoConEtiqueta>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-carbon/80">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={oferta?.is_active ?? true}
          className="h-4 w-4 accent-terracota"
        />
        Oferta activa
      </label>

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

      <Boton type="submit" className="mt-1" disabled={pendiente}>
        {pendiente ? "Guardando..." : oferta ? "Guardar" : "Crear oferta"}
      </Boton>
    </form>
  );
}
