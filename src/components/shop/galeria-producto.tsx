"use client";

import Image from "next/image";
import { useState } from "react";

import { PlaceholderImagen } from "@/components/ui/marca";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GaleriaProducto({
  imagenes,
  nombre,
}: {
  imagenes: ProductImage[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-marca bg-beige/30">
        <PlaceholderImagen texto={nombre} />
      </div>
    );
  }

  const principal = imagenes[Math.min(activa, imagenes.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-marca border border-arena/25 bg-beige/30">
        <Image
          src={principal.url}
          alt={principal.alt ?? nombre}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      {imagenes.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {imagenes.map((imagen, indice) => (
            <button
              key={imagen.id}
              onClick={() => setActiva(indice)}
              aria-label={`Ver imagen ${indice + 1}`}
              aria-current={indice === activa}
              className={cn(
                "relative aspect-square overflow-hidden rounded-marca border transition-colors",
                indice === activa
                  ? "border-terracota"
                  : "border-arena/30 hover:border-arena",
              )}
            >
              <Image
                src={imagen.url}
                alt=""
                fill
                sizes="90px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
