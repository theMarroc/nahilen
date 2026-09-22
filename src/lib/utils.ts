import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formateadorARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 12500 → "$ 12.500" */
export function formatARS(valor: number) {
  return formateadorARS.format(Math.round(valor)).replace(/\s/g, " ");
}

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Código corto y legible para los pedidos: NAH-7F3K2 */
export function generarCodigoPedido() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let salida = "";
  for (let i = 0; i < 5; i += 1) {
    salida += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `NAH-${salida}`;
}

export function tokenAleatorio(largo = 24) {
  const alfabeto = "abcdefghijklmnopqrstuvwxyz0123456789";
  let salida = "";
  for (let i = 0; i < largo; i += 1) {
    salida += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return salida;
}

export function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Redondeo comercial para los aumentos de precio. */
export function redondear(valor: number, a: "1" | "10" | "50" | "100" | "500") {
  const paso = Number(a);
  return Math.round(valor / paso) * paso;
}
