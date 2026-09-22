import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";

import { AgregarConCantidad } from "@/components/cart/boton-agregar";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp, PlaceholderImagen } from "@/components/ui/marca";
import { getAjustes, getCombo, getOfertas, getProductoPorId } from "@/lib/db";
import { calcularPrecio } from "@/lib/pricing";
import { ajuste, linkWhatsapp } from "@/lib/settings";
import { formatARS } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const combo = await getCombo(slug);
  if (!combo) return { title: "Combo no encontrado" };

  return {
    title: combo.name,
    description: combo.description ?? undefined,
  };
}

export default async function PaginaCombo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [combo, ofertas, ajustes] = await Promise.all([
    getCombo(slug),
    getOfertas(),
    getAjustes(),
  ]);

  if (!combo || !combo.is_active) notFound();

  // Buscamos los productos incluidos para poder mostrar el ahorro real.
  const incluidos = await Promise.all(
    (combo.items ?? []).map(async (item) => {
      const producto = item.product ?? (await getProductoPorId(item.product_id));
      return { item, producto };
    }),
  );

  const precioSuelto = incluidos.reduce((acumulado, { item, producto }) => {
    if (!producto) return acumulado;
    const precio = calcularPrecio(
      { id: producto.id, category_id: null, price: Number(producto.price) },
      ofertas,
    );
    return acumulado + precio.lista * item.quantity;
  }, 0);

  const ahorro = precioSuelto - Number(combo.price);

  return (
    <>
      <div className="contenedor pt-8">
        <nav
          aria-label="Ubicación"
          className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-arena"
        >
          <Link href="/" className="transition-colors hover:text-marron">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/combos" className="transition-colors hover:text-marron">
            Combos
          </Link>
        </nav>
      </div>

      <article className="contenedor grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <div className="relative aspect-square overflow-hidden rounded-marca border border-arena/25 bg-beige/30">
          {combo.image_url ? (
            <Image
              src={combo.image_url}
              alt={combo.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImagen texto={combo.name} />
          )}
        </div>

        <div className="flex flex-col">
          <Insignia className="mb-3 self-start bg-mostaza text-carbon">Combo</Insignia>

          <h1 className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-tight text-marron">
            {combo.name}
          </h1>

          <span className="linea-decorativa mt-5" />

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-display text-4xl text-carbon">
              {formatARS(Number(combo.price))}
            </p>
            {ahorro > 0 ? (
              <p className="text-lg text-arena line-through">{formatARS(precioSuelto)}</p>
            ) : null}
          </div>

          {ahorro > 0 ? (
            <p className="mt-1 text-sm font-semibold text-oliva">
              Ahorrás {formatARS(ahorro)} comprándolo así
            </p>
          ) : null}

          {combo.description ? (
            <p className="mt-6 text-[15px] leading-relaxed text-carbon/75">
              {combo.description}
            </p>
          ) : null}

          {incluidos.length > 0 ? (
            <div className="mt-7 rounded-marca border border-arena/30 bg-white p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-marron">
                Qué incluye
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-carbon/75">
                {incluidos.map(({ item, producto }) => (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-oliva"
                      strokeWidth={2}
                    />
                    <span>
                      {item.quantity > 1 ? `${item.quantity} × ` : ""}
                      {producto ? (
                        <Link
                          href={`/producto/${producto.slug}`}
                          className="underline decoration-arena/50 underline-offset-2 transition-colors hover:text-terracota"
                        >
                          {producto.name}
                        </Link>
                      ) : (
                        "Producto no disponible"
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8">
            <AgregarConCantidad
              item={{
                tipo: "combo",
                id: combo.id,
                slug: combo.slug,
                nombre: combo.name,
                precio: Number(combo.price),
                precioLista: Number(combo.price),
                unidad: null,
                imagen: combo.image_url,
              }}
            />
          </div>

          <a
            href={linkWhatsapp(
              ajuste(ajustes, "whatsapp_numero"),
              `¡Hola! Quería consultar por el ${combo.name}`,
            )}
            target="_blank"
            rel="noreferrer"
            className={estilosBoton("secundario", "md", "mt-3 self-start")}
          >
            <IconoWhatsapp className="h-4 w-4" />
            Consultar por WhatsApp
          </a>
        </div>
      </article>
    </>
  );
}
