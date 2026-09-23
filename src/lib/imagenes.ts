/**
 * Achica fotos en el navegador antes de subirlas.
 *
 * Una foto de celular pesa 3-8 MB; achicada a 2000 px de lado mayor queda en
 * unos cientos de KB y se sigue leyendo perfecto (sirve para comprobantes y
 * productos). Además cuida el 1 GB de almacenamiento del plan gratis.
 *
 * Solo funciona en el navegador (usa canvas).
 */

const LADO_MAXIMO = 2000;
const CALIDAD_JPEG = 0.85;
/** Por debajo de este peso y de LADO_MAXIMO, la imagen se sube tal cual. */
const PESO_SIN_TOCAR = 1024 * 1024;

export type ResultadoCompresion = {
  archivo: Blob;
  tipo: string;
  pesoOriginal: number;
  pesoFinal: number;
  achicada: boolean;
};

async function cargarImagen(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap respeta la orientación EXIF de las fotos de celular.
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(archivo);
  }

  const url = URL.createObjectURL(archivo);
  try {
    const imagen = new Image();
    imagen.src = url;
    await imagen.decode();
    return imagen;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function comprimirImagen(archivo: File): Promise<ResultadoCompresion> {
  const sinCambios: ResultadoCompresion = {
    archivo,
    tipo: archivo.type,
    pesoOriginal: archivo.size,
    pesoFinal: archivo.size,
    achicada: false,
  };

  if (!archivo.type.startsWith("image/")) return sinCambios;

  let imagen: ImageBitmap | HTMLImageElement;
  try {
    imagen = await cargarImagen(archivo);
  } catch {
    // Formato que el navegador no sabe leer: se intenta subir el original.
    return sinCambios;
  }

  const ancho = imagen.width;
  const alto = imagen.height;
  const escala = Math.min(1, LADO_MAXIMO / Math.max(ancho, alto));

  if (escala === 1 && archivo.size <= PESO_SIN_TOCAR) {
    if ("close" in imagen) imagen.close();
    return sinCambios;
  }

  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(ancho * escala);
  lienzo.height = Math.round(alto * escala);

  const contexto = lienzo.getContext("2d");
  if (!contexto) return sinCambios;

  // Fondo blanco: las capturas PNG con transparencia saldrían negras en JPEG.
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  if ("close" in imagen) imagen.close();

  const blob = await new Promise<Blob | null>((resolver) =>
    lienzo.toBlob(resolver, "image/jpeg", CALIDAD_JPEG),
  );

  // Si por algún motivo quedó más pesada (pasa con capturas simples), gana el original.
  if (!blob || blob.size >= archivo.size) return sinCambios;

  return {
    archivo: blob,
    tipo: "image/jpeg",
    pesoOriginal: archivo.size,
    pesoFinal: blob.size,
    achicada: true,
  };
}

export function formatearPeso(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
