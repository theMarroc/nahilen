"use client";

import { AlertCircle, Check, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { startTransition, useOptimistic, useState, useTransition } from "react";

import { cambiarEstadoPedido } from "@/actions/admin/pedidos";
import { ESTADOS_PEDIDO, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** El recorrido normal de un pedido, en orden. Cancelado va aparte. */
const RECORRIDO: OrderStatus[] = [
  "pendiente_pago",
  "comprobante_enviado",
  "pagado",
  "en_preparacion",
  "entregado",
];

/**
 * Selector de estado: cada estado es un botón. El cambio se ve al instante
 * (optimista) y, si el servidor lo rechaza, vuelve al estado anterior.
 */
export function EstadoPedido({
  pedidoId,
  estadoInicial,
}: {
  pedidoId: string;
  estadoInicial: OrderStatus;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [delServidor, setDelServidor] = useState(estadoInicial);
  const [mostrado, setMostrado] = useOptimistic(estado);

  // Si el servidor trae otro estado (por ejemplo, lo cambió el webhook de
  // Mercado Pago), se adopta. Se ajusta en el render para no perder el aviso.
  if (estadoInicial !== delServidor) {
    setDelServidor(estadoInicial);
    setEstado(estadoInicial);
  }
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  function elegir(nuevo: OrderStatus) {
    if (nuevo === mostrado || pendiente) return;

    if (
      nuevo === "cancelado" &&
      !window.confirm(
        "¿Cancelar este pedido? Si tiene productos con stock controlado, las unidades vuelven al stock.",
      )
    ) {
      return;
    }

    setAviso(null);
    iniciar(async () => {
      setMostrado(nuevo);
      const resultado = await cambiarEstadoPedido(pedidoId, nuevo);

      startTransition(() => {
        if (resultado.ok) setEstado(nuevo);
        setAviso({ ok: resultado.ok, texto: resultado.mensaje });
      });

      if (resultado.ok) {
        window.setTimeout(() => setAviso(null), 3500);
      }
    });
  }

  const posicion = RECORRIDO.indexOf(mostrado);
  const cancelado = mostrado === "cancelado";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-arena">Tocá un estado para cambiarlo.</p>

      <ol className="flex flex-col gap-1.5">
        {RECORRIDO.map((clave, indice) => {
          const actual = clave === mostrado;
          const hecho = !cancelado && indice < posicion;

          return (
            <li key={clave}>
              <button
                type="button"
                onClick={() => elegir(clave)}
                disabled={pendiente}
                aria-pressed={actual}
                className={cn(
                  "flex w-full items-center gap-3 rounded-marca border px-3 py-2 text-left text-sm transition-colors disabled:cursor-wait",
                  actual
                    ? "border-terracota bg-terracota/8 font-semibold text-marron"
                    : "border-arena/30 text-carbon/70 hover:border-arena hover:bg-crema/60",
                  cancelado && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    actual
                      ? "border-terracota bg-terracota text-white"
                      : hecho
                        ? "border-oliva bg-oliva text-white"
                        : "border-arena/60 text-arena",
                  )}
                >
                  {actual && pendiente ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : actual || hecho ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    indice + 1
                  )}
                </span>
                {ESTADOS_PEDIDO[clave].label}
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => elegir("cancelado")}
        disabled={pendiente}
        aria-pressed={cancelado}
        className={cn(
          "flex w-full items-center gap-3 rounded-marca border px-3 py-2 text-left text-sm transition-colors disabled:cursor-wait",
          cancelado
            ? "border-carbon/40 bg-carbon/5 font-semibold text-carbon"
            : "border-transparent text-terracota-oscuro hover:bg-terracota/10",
        )}
      >
        {cancelado && pendiente ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        )}
        {cancelado ? "Pedido cancelado" : "Cancelar pedido"}
      </button>

      {aviso ? (
        <p
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-marca px-3 py-2 text-xs leading-relaxed",
            aviso.ok
              ? "border border-oliva/40 bg-oliva/10 text-oliva"
              : "border border-terracota/40 bg-terracota/10 text-terracota-oscuro",
          )}
        >
          {aviso.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          )}
          {aviso.texto}
        </p>
      ) : null}
    </div>
  );
}
