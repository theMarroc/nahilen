"use client";

import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { borrarPedido } from "@/actions/admin/pedidos";
import { estilosBoton } from "@/components/ui/boton";

export function BorrarPedido({ pedidoId, codigo }: { pedidoId: string; codigo: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (!window.confirm(`¿Borrar el pedido ${codigo}? Esto no se puede deshacer.`)) {
            return;
          }
          setError(null);
          iniciar(async () => {
            // Si sale bien, la acción redirige a la lista de pedidos.
            const resultado = await borrarPedido(pedidoId);
            if (resultado && !resultado.ok) setError(resultado.mensaje);
          });
        }}
        className={estilosBoton("peligro", "sm", "w-full")}
      >
        {pendiente ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {pendiente ? "Borrando..." : "Borrar el pedido"}
      </button>

      {error ? (
        <p
          aria-live="polite"
          className="mt-3 flex items-start gap-2 rounded-marca border border-terracota/40 bg-terracota/10 px-3 py-2 text-xs text-terracota-oscuro"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      ) : null}
    </>
  );
}
