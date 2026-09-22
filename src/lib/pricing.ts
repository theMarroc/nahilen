import type { Offer, Product } from "./types";

export type PrecioCalculado = {
  /** Precio final a cobrar. */
  final: number;
  /** Precio de lista (tachado) cuando hay oferta. */
  lista: number;
  /** Cuanto se descuenta por unidad. */
  descuento: number;
  /** Porcentaje de descuento redondeado, para el badge. */
  porcentaje: number;
  oferta: Offer | null;
};

function ofertaVigente(oferta: Offer, ahora: Date) {
  if (!oferta.is_active) return false;
  if (oferta.starts_at && new Date(oferta.starts_at) > ahora) return false;
  if (oferta.ends_at && new Date(oferta.ends_at) < ahora) return false;
  return true;
}

function ofertaAplica(oferta: Offer, producto: Pick<Product, "id" | "category_id">) {
  if (oferta.scope === "all") return true;
  if (oferta.scope === "category") return oferta.category_id === producto.category_id;
  if (oferta.scope === "product") return oferta.product_id === producto.id;
  return false;
}

function montoDescuento(oferta: Offer, precio: number) {
  const bruto = oferta.kind === "percent" ? (precio * oferta.value) / 100 : oferta.value;
  return Math.min(Math.max(bruto, 0), precio);
}

/**
 * Aplica la mejor oferta vigente para un producto.
 * Los descuentos no se acumulan: gana el que mas le conviene al cliente.
 */
export function calcularPrecio(
  producto: Pick<Product, "id" | "category_id" | "price">,
  ofertas: Offer[],
  ahora = new Date(),
): PrecioCalculado {
  const lista = Number(producto.price) || 0;

  let mejorOferta: Offer | null = null;
  let mejorDescuento = 0;

  for (const oferta of ofertas) {
    if (!ofertaVigente(oferta, ahora) || !ofertaAplica(oferta, producto)) continue;
    const descuento = montoDescuento(oferta, lista);
    if (descuento > mejorDescuento) {
      mejorDescuento = descuento;
      mejorOferta = oferta;
    }
  }

  const final = Math.round(lista - mejorDescuento);

  return {
    final,
    lista,
    descuento: lista - final,
    porcentaje: lista > 0 ? Math.round(((lista - final) / lista) * 100) : 0,
    oferta: mejorOferta,
  };
}

export function etiquetaOferta(oferta: Offer, precio: PrecioCalculado) {
  if (oferta.label) return oferta.label;
  if (oferta.kind === "percent") return `${Math.round(oferta.value)}% OFF`;
  return `${precio.porcentaje}% OFF`;
}
