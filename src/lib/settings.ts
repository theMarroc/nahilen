import type { Settings } from "./types";

/**
 * Valores por defecto de todos los textos y parámetros editables.
 * La tabla `settings` de Supabase solo guarda lo que se cambia:
 * si una clave no está guardada, se usa el valor de acá.
 */
export const AJUSTES_POR_DEFECTO = {
  // --- Marca -------------------------------------------------------------
  marca_nombre: "Nahilén",
  marca_claim: "Cálida · Natural · Femenina · Auténtica",
  frase_destacada: "Lo simple es hermoso.",

  // --- Portada -----------------------------------------------------------
  hero_titulo: "Dulzura natural,",
  hero_titulo_cursiva: "hecha para vos.",
  hero_texto:
    "Mermeladas y budines artesanales, hechos en casa con fruta de estación y sin conservantes.",
  hero_cta_texto: "Ver la tienda",
  hero_cta_link: "/tienda",
  hero_imagen: "",

  // --- Textos de secciones ----------------------------------------------
  categorias_titulo: "Nuestras",
  categorias_titulo_cursiva: "categorías",
  categorias_texto:
    "Elaborados en tandas chicas para que cada frasco llegue como recién hecho.",
  destacados_titulo: "Los más",
  destacados_titulo_cursiva: "pedidos",
  ofertas_titulo: "Ofertas de la",
  ofertas_titulo_cursiva: "semana",
  combos_titulo: "Combos para",
  combos_titulo_cursiva: "regalar",
  carrusel_titulo: "Un poco de",
  carrusel_titulo_cursiva: "nuestro taller",
  faq_titulo: "Preguntas",
  faq_titulo_cursiva: "frecuentes",
  newsletter_titulo: "Sumate a Nahilén",
  newsletter_texto: "Recibí novedades, nuevos sabores y ofertas exclusivas.",

  nosotros_titulo: "Sobre",
  nosotros_titulo_cursiva: "Nahilén",
  nosotros_texto:
    "Nahilén nace en una cocina de casa, con recetas de familia y fruta comprada en la feria. Cada mermelada se cocina en tandas chicas, se envasa a mano y se etiqueta una por una. No hay conservantes ni colorantes: solo fruta, azúcar y tiempo.",

  // --- Contacto y redes --------------------------------------------------
  whatsapp_numero: "5492610000000",
  whatsapp_mensaje: "¡Hola Nahilén! Quería hacerte una consulta",
  instagram_url: "https://www.instagram.com/dulces.nahilen",
  facebook_url: "",
  email_contacto: "",

  // --- Pagos -------------------------------------------------------------
  pago_transferencia_activo: "true",
  pago_mercadopago_activo: "false",
  transferencia_titular: "",
  transferencia_alias: "",
  transferencia_cbu: "",
  transferencia_banco: "",

  // --- Envíos ------------------------------------------------------------
  envio_costo: "0",
  envio_gratis_desde: "0",
  pedido_minimo: "0",
  retiro_activo: "true",
  retiro_direccion: "",
  zona_delivery_titulo: "Zona de",
  zona_delivery_titulo_cursiva: "entrega",
  zona_delivery_texto:
    "Hacemos entregas los viernes y sábados. Consultanos por tu barrio.",
  mapa_embed_url: "",
} satisfies Record<string, string>;

export type ClaveAjuste = keyof typeof AJUSTES_POR_DEFECTO;

/** Lee un ajuste con su valor por defecto como respaldo. */
export function ajuste(ajustes: Settings, clave: ClaveAjuste) {
  const valor = ajustes[clave];
  if (valor === undefined || valor === null || valor === "") {
    return AJUSTES_POR_DEFECTO[clave];
  }
  return valor;
}

/** Igual que `ajuste` pero devuelve "" si no hay valor guardado (sin default). */
export function ajusteCrudo(ajustes: Settings, clave: ClaveAjuste) {
  return ajustes[clave] ?? "";
}

export function esVerdadero(valor: string | undefined) {
  return valor === "true" || valor === "1" || valor === "on";
}

export function aNumero(valor: string | undefined, porDefecto = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
}

/** Normaliza un número de WhatsApp a solo dígitos (formato wa.me). */
export function normalizarWhatsapp(numero: string) {
  return numero.replace(/\D/g, "");
}

export function linkWhatsapp(numero: string, mensaje: string) {
  const limpio = normalizarWhatsapp(numero);
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
