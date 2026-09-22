import { Info } from "lucide-react";

/**
 * Se muestra solo cuando faltan las variables de entorno de Supabase.
 * En ese caso el sitio funciona con productos de ejemplo.
 */
export function AvisoDemo() {
  return (
    <div className="border-b border-terracota/30 bg-terracota/10 px-4 py-3">
      <p className="contenedor flex items-start gap-2.5 text-xs leading-relaxed text-terracota-oscuro">
        <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
        <span>
          <strong className="font-semibold">Modo demostración.</strong> Estos productos
          son de ejemplo: todavía falta conectar la base de datos. Seguí los pasos del
          archivo <code className="font-mono">README.md</code> para activar el panel de
          administración.
        </span>
      </p>
    </div>
  );
}
