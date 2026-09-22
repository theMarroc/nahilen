import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CreditCard, Package, Truck } from "lucide-react";

import { AgregarConCantidad } from "@/components/cart/boton-agregar";
import { GaleriaProducto } from "@/components/shop/galeria-producto";
import { GrillaProductos } from "@/components/shop/tarjeta-producto";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes, getOfertas, getProducto, getProductos } from "@/lib/db";
import { calcularPrecio, etiquetaOferta } from "@/lib/pricing";
import { aNumero, ajuste, esVerdadero, linkWhatsapp } from "@/lib/settings";
import { formatARS } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);

  if (!producto) return { title: "Producto no encontrado" };

  return {
    title: producto.name,
    description: producto.description ?? undefined,
    openGraph: {
      title: producto.name,
      description: producto.description ?? undefined,
      images: producto.images[0]?.url ? [producto.images[0].url] : undefined,
    },
  };
}

export default async function PaginaProducto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [producto, ofertas, ajustes] = await Promise.all([
    getProducto(slug),
    getOfertas(),
    getAjustes(),
  ]);

  if (!producto || !producto.is_active) notFound();

  const precio = calcularPrecio(producto, ofertas);
  const agotado = producto.track_stock && producto.stock <= 0;
  const costoEnvio = aNumero(ajustes.envio_costo);
  const envioGratis = aNumero(ajustes.envio_gratis_desde);

  const relacionados = producto.category
    ? (await getProductos({ categoria: producto.category.slug }))
        .filter((p) => p.id !== producto.id)
        .slice(0, 4)
    : [];

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
          <Link href="/tienda" className="transition-colors hover:text-marron">
            Tienda
          </Link>
          {producto.category ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/tienda?categoria=${producto.category.slug}`}
                className="transition-colors hover:text-marron"
              >
                {producto.category.name}
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <article className="contenedor grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <GaleriaProducto imagenes={producto.images} nombre={producto.name} />

        <div className="flex flex-col">
          {precio.oferta ? (
            <Insignia className="mb-3 self-start bg-terracota text-white">
              {etiquetaOferta(precio.oferta, precio)}
            </Insignia>
          ) : null}

          <h1 className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-tight text-marron">
            {producto.name}
          </h1>

          {producto.unit ? (
            <p className="mt-2 text-sm text-arena">{producto.unit}</p>
          ) : null}

          <span className="linea-decorativa mt-5" />

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-display text-4xl text-carbon">{formatARS(precio.final)}</p>
            {precio.oferta ? (
              <p className="text-lg text-arena line-through">{formatARS(precio.lista)}</p>
            ) : null}
          </div>

          {precio.descuento > 0 ? (
            <p className="mt-1 text-sm font-semibold text-oliva">
              Ahorrás {formatARS(precio.descuento)}
            </p>
          ) : null}

          {producto.description ? (
            <p className="mt-6 text-[15px] leading-relaxed text-carbon/75">
              {producto.description}
            </p>
          ) : null}

          <div className="mt-8">
            <AgregarConCantidad
              agotado={agotado}
              stockMaximo={producto.track_stock ? producto.stock : undefined}
              item={{
                tipo: "product",
                id: producto.id,
                slug: producto.slug,
                nombre: producto.name,
                precio: precio.final,
                precioLista: precio.lista,
                unidad: producto.unit,
                imagen: producto.images[0]?.url ?? null,
              }}
            />
          </div>

          <a
            href={linkWhatsapp(
              ajuste(ajustes, "whatsapp_numero"),
              `¡Hola! Quería consultar por ${producto.name}`,
            )}
            target="_blank"
            rel="noreferrer"
            className={estilosBoton("secundario", "md", "mt-3 self-start")}
          >
            <IconoWhatsapp className="h-4 w-4" />
            Consultar por WhatsApp
          </a>

          <ul className="mt-8 flex flex-col gap-3 border-t border-arena/25 pt-6 text-sm text-carbon/70">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>
                Entrega a domicilio{" "}
                {costoEnvio > 0 ? <>por {formatARS(costoEnvio)}</> : "a coordinar"}
                {envioGratis > 0 ? <> — sin cargo desde {formatARS(envioGratis)}</> : null}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracota" strokeWidth={1.4} />
              <span>
                {esVerdadero(ajustes.pago_mercadopago_activo)
                  ? "Pagás con Mercado Pago o por transferencia."
                  : "Pagás por transferencia bancaria y nos enviás el comprobante."}
              </span>
            </li>
            {esVerdadero(ajustes.retiro_activo ?? "true") ? (
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 h-4.5 w-4.5 shrink-0 text-terracota" strokeWidth={1.4} />
                <span>También podés retirarlo sin costo.</span>
              </li>
            ) : null}
          </ul>

          {producto.long_description ? (
            <div className="mt-8 border-t border-arena/25 pt-6">
              <h2 className="font-display text-xl text-marron">Más sobre este producto</h2>
              <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-carbon/75">
                {producto.long_description
                  .split(/\n{2,}/)
                  .map((parrafo, indice) => (
                    <p key={indice}>{parrafo}</p>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      {relacionados.length > 0 ? (
        <section className="bg-crema py-16">
          <div className="contenedor">
            <h2 className="titulo-seccion text-marron">
              También te puede <span className="italic text-terracota">gustar</span>
            </h2>
            <span className="linea-decorativa mt-5" />
            <div className="mt-10">
              <GrillaProductos productos={relacionados} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
