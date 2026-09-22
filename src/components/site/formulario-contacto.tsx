"use client";

import { useState } from "react";

import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { linkWhatsapp } from "@/lib/settings";

/**
 * El formulario no manda mails: arma el mensaje y abre WhatsApp.
 * Es lo que realmente usa el negocio y no necesita servidor de correo.
 */
export function FormularioContacto({ whatsapp }: { whatsapp: string }) {
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const texto = [
    nombre ? `¡Hola! Soy ${nombre}.` : "¡Hola!",
    asunto ? `Motivo: ${asunto}` : "",
    mensaje,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        window.open(linkWhatsapp(whatsapp, texto), "_blank", "noopener");
      }}
      className="flex flex-col gap-4 rounded-marca border border-arena/30 bg-white p-6 shadow-suave"
    >
      <CampoConEtiqueta etiqueta="Tu nombre" requerido>
        <Campo
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Como te llamás"
        />
      </CampoConEtiqueta>

      <CampoConEtiqueta etiqueta="Motivo">
        <Campo
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Un pedido grande, un regalo, una consulta..."
        />
      </CampoConEtiqueta>

      <CampoConEtiqueta etiqueta="Tu mensaje" requerido>
        <AreaTexto
          required
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Contanos qué necesitás"
        />
      </CampoConEtiqueta>

      <button type="submit" className={estilosBoton("primario", "md", "w-full")}>
        <IconoWhatsapp className="h-4 w-4" />
        Enviar por WhatsApp
      </button>

      <p className="text-center text-xs leading-relaxed text-arena">
        Se abre WhatsApp con el mensaje ya escrito. Solo tenés que apretar enviar.
      </p>
    </form>
  );
}
