"use client";

import { useActionState, useState } from "react";

import { ingresar, registrarse, type EstadoAuth } from "@/actions/auth";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { cn } from "@/lib/utils";

export function PanelIngreso({ volver }: { volver: string }) {
  const [modo, setModo] = useState<"ingresar" | "registrarse">("ingresar");

  const [estadoIngreso, accionIngreso, ingresando] = useActionState<EstadoAuth, FormData>(
    ingresar,
    null,
  );
  const [estadoRegistro, accionRegistro, registrando] = useActionState<
    EstadoAuth,
    FormData
  >(registrarse, null);

  const estado = modo === "ingresar" ? estadoIngreso : estadoRegistro;

  return (
    <div className="rounded-marca border border-arena/30 bg-white p-6 shadow-suave sm:p-8">
      <div
        role="tablist"
        aria-label="Ingresar o crear cuenta"
        className="mb-6 grid grid-cols-2 rounded-marca border border-arena/35 p-1"
      >
        {(["ingresar", "registrarse"] as const).map((opcion) => (
          <button
            key={opcion}
            role="tab"
            aria-selected={modo === opcion}
            onClick={() => setModo(opcion)}
            className={cn(
              "rounded-marca py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
              modo === opcion
                ? "bg-carbon text-crema"
                : "text-carbon/60 hover:text-carbon",
            )}
          >
            {opcion === "ingresar" ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        ))}
      </div>

      {modo === "ingresar" ? (
        <form action={accionIngreso} className="flex flex-col gap-4">
          <input type="hidden" name="volver" value={volver} />

          <CampoConEtiqueta etiqueta="Correo" requerido>
            <Campo name="email" type="email" required autoComplete="email" />
          </CampoConEtiqueta>

          <CampoConEtiqueta etiqueta="Contraseña" requerido>
            <Campo
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </CampoConEtiqueta>

          <Boton type="submit" className="mt-1 w-full" disabled={ingresando}>
            {ingresando ? "Entrando..." : "Ingresar"}
          </Boton>
        </form>
      ) : (
        <form action={accionRegistro} className="flex flex-col gap-4">
          <input type="hidden" name="volver" value={volver} />

          <CampoConEtiqueta etiqueta="Nombre y apellido" requerido>
            <Campo name="nombre" required autoComplete="name" />
          </CampoConEtiqueta>

          <CampoConEtiqueta etiqueta="WhatsApp" ayuda="Para coordinar las entregas">
            <Campo name="telefono" type="tel" autoComplete="tel" />
          </CampoConEtiqueta>

          <CampoConEtiqueta etiqueta="Correo" requerido>
            <Campo name="email" type="email" required autoComplete="email" />
          </CampoConEtiqueta>

          <CampoConEtiqueta
            etiqueta="Contraseña"
            requerido
            ayuda="Mínimo 6 caracteres"
          >
            <Campo
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </CampoConEtiqueta>

          <Boton type="submit" className="mt-1 w-full" disabled={registrando}>
            {registrando ? "Creando..." : "Crear mi cuenta"}
          </Boton>
        </form>
      )}

      {estado ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-4 rounded-marca px-3 py-2.5 text-xs leading-relaxed",
            estado.ok
              ? "border border-oliva/40 bg-oliva/10 text-oliva"
              : "border border-terracota/40 bg-terracota/10 text-terracota-oscuro",
          )}
        >
          {estado.mensaje}
        </p>
      ) : null}
    </div>
  );
}
