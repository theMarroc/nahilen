"use client";

import { Home, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";

import {
  borrarDireccion,
  guardarDireccion,
  marcarPredeterminada,
  type EstadoDireccion,
} from "@/actions/direcciones";
import { Boton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Insignia } from "@/components/ui/campos";
import type { Address } from "@/lib/types";

export function GestorDirecciones({ direcciones }: { direcciones: Address[] }) {
  const [editando, setEditando] = useState<Address | "nueva" | null>(
    direcciones.length === 0 ? "nueva" : null,
  );

  const [estado, accion, guardando] = useActionState<EstadoDireccion, FormData>(
    async (anterior, datos) => {
      const resultado = await guardarDireccion(anterior, datos);
      if (resultado?.ok) setEditando(null);
      return resultado;
    },
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      {direcciones.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {direcciones.map((direccion) => (
            <li
              key={direccion.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-marca border border-arena/30 bg-white p-4 shadow-suave"
            >
              <div className="flex gap-3">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-arena" strokeWidth={1.4} />
                <div>
                  <p className="flex items-center gap-2 font-semibold text-marron">
                    {direccion.label}
                    {direccion.is_default ? (
                      <Insignia className="bg-mostaza/40 text-marron">Principal</Insignia>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-carbon/70">
                    {direccion.street} {direccion.number}
                    {direccion.apartment ? `, ${direccion.apartment}` : ""} —{" "}
                    {direccion.city}
                    {direccion.zone ? ` (${direccion.zone})` : ""}
                  </p>
                  {direccion.notes ? (
                    <p className="mt-1 text-xs text-arena">{direccion.notes}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!direccion.is_default ? (
                  <form action={marcarPredeterminada}>
                    <input type="hidden" name="id" value={direccion.id} />
                    <button
                      type="submit"
                      title="Usar como principal"
                      className="rounded-marca p-2 text-arena transition-colors hover:bg-mostaza/20 hover:text-marron"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </form>
                ) : null}

                <button
                  onClick={() => setEditando(direccion)}
                  title="Editar"
                  className="rounded-marca p-2 text-arena transition-colors hover:bg-beige/40 hover:text-marron"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <form action={borrarDireccion}>
                  <input type="hidden" name="id" value={direccion.id} />
                  <button
                    type="submit"
                    title="Borrar"
                    className="rounded-marca p-2 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {editando ? (
        <form
          action={accion}
          className="rounded-marca border border-arena/30 bg-white p-5 shadow-suave"
        >
          {editando !== "nueva" ? (
            <input type="hidden" name="id" value={editando.id} />
          ) : null}

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-marron">
              {editando === "nueva" ? "Nueva dirección" : "Editar dirección"}
            </h3>
            {direcciones.length > 0 ? (
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-marca p-1.5 text-arena transition-colors hover:text-marron"
                aria-label="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta
              etiqueta="Nombre de la dirección"
              requerido
              className="sm:col-span-2"
              ayuda="Casa, trabajo..."
            >
              <Campo
                name="label"
                required
                defaultValue={editando === "nueva" ? "Mi casa" : editando.label}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Calle" requerido className="sm:col-span-3">
              <Campo
                name="street"
                required
                defaultValue={editando === "nueva" ? "" : editando.street}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Altura" requerido className="sm:col-span-1">
              <Campo
                name="number"
                required
                defaultValue={editando === "nueva" ? "" : editando.number}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Piso / depto" className="sm:col-span-2">
              <Campo
                name="apartment"
                defaultValue={editando === "nueva" ? "" : (editando.apartment ?? "")}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Localidad" requerido className="sm:col-span-2">
              <Campo
                name="city"
                required
                defaultValue={editando === "nueva" ? "" : editando.city}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Barrio" className="sm:col-span-2">
              <Campo
                name="zone"
                defaultValue={editando === "nueva" ? "" : (editando.zone ?? "")}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Indicaciones"
              className="sm:col-span-6"
              ayuda="Timbre, color de la puerta, horarios en los que estás"
            >
              <AreaTexto
                name="notes"
                rows={2}
                defaultValue={editando === "nueva" ? "" : (editando.notes ?? "")}
              />
            </CampoConEtiqueta>
          </div>

          <label className="mt-4 flex items-center gap-2.5 text-sm text-carbon/75">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={editando === "nueva" ? direcciones.length === 0 : editando.is_default}
              className="h-4 w-4 accent-terracota"
            />
            Usar como dirección principal
          </label>

          {estado && !estado.ok ? (
            <p className="mt-3 rounded-marca border border-terracota/40 bg-terracota/10 px-3 py-2 text-xs text-terracota-oscuro">
              {estado.mensaje}
            </p>
          ) : null}

          <Boton type="submit" tamano="sm" className="mt-4" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar dirección"}
          </Boton>
        </form>
      ) : (
        <Boton
          variante="secundario"
          tamano="sm"
          className="self-start"
          onClick={() => setEditando("nueva")}
        >
          <Plus className="h-4 w-4" />
          Agregar otra dirección
        </Boton>
      )}
    </div>
  );
}
