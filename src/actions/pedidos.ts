"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getUsuario } from "@/lib/auth";
import { calcularPrecio } from "@/lib/pricing";
import { aNumero, esVerdadero } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/server";
import type { Offer, OrderItem } from "@/lib/types";
import { generarCodigoPedido, tokenAleatorio } from "@/lib/utils";

export type ResultadoPedido =
  | { ok: true; url: string }
  | { ok: false; mensaje: string }
  | null;

const esquemaItem = z.object({
  tipo: z.enum(["product", "combo"]),
  id: z.string().min(1),
  cantidad: z.number().int().min(1).max(99),
});

const esquemaPedido = z.object({
  nombre: z.string().trim().min(2, "Escribí tu nombre y apellido."),
  telefono: z
    .string()
    .trim()
    .min(6, "Necesitamos un teléfono para coordinar la entrega."),
  email: z.union([z.string().trim().email("Revisá el correo."), z.literal("")]),
  entrega: z.enum(["delivery", "pickup"]),
  pago: z.enum(["mercadopago", "transfer"]),
  calle: z.string().trim().default(""),
  numero: z.string().trim().default(""),
  piso: z.string().trim().default(""),
  ciudad: z.string().trim().default(""),
  barrio: z.string().trim().default(""),
  indicaciones: z.string().trim().default(""),
  notas: z.string().trim().max(500).default(""),
  guardarDireccion: z.boolean().default(false),
});

/** Lee los ajustes sin pasar por la caché de lectura pública. */
async function leerAjustes(supabase: ReturnType<typeof createAdminClient>) {
  const { data } = await supabase.from("settings").select("key, value");
  return Object.fromEntries((data ?? []).map((f) => [f.key, f.value ?? ""]));
}

export async function crearPedido(
  _anterior: ResultadoPedido,
  datos: FormData,
): Promise<ResultadoPedido> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      mensaje:
        "El sitio todavía no está conectado a la base de datos, así que no se pueden registrar pedidos. Escribinos por WhatsApp y lo tomamos a mano.",
    };
  }

  // --- Validación de los datos del formulario -----------------------------
  const analisis = esquemaPedido.safeParse({
    nombre: datos.get("nombre"),
    telefono: datos.get("telefono"),
    email: datos.get("email") ?? "",
    entrega: datos.get("entrega"),
    pago: datos.get("pago"),
    calle: datos.get("calle") ?? "",
    numero: datos.get("numero") ?? "",
    piso: datos.get("piso") ?? "",
    ciudad: datos.get("ciudad") ?? "",
    barrio: datos.get("barrio") ?? "",
    indicaciones: datos.get("indicaciones") ?? "",
    notas: datos.get("notas") ?? "",
    guardarDireccion: datos.get("guardarDireccion") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }
  const formulario = analisis.data;

  if (formulario.entrega === "delivery") {
    if (!formulario.calle || !formulario.numero || !formulario.ciudad) {
      return {
        ok: false,
        mensaje: "Para el envío a domicilio necesitamos calle, número y localidad.",
      };
    }
  }

  // --- Items del carrito ---------------------------------------------------
  let itemsCrudos: unknown;
  try {
    itemsCrudos = JSON.parse(String(datos.get("items") ?? "[]"));
  } catch {
    return { ok: false, mensaje: "No pudimos leer tu carrito. Probá de nuevo." };
  }

  const itemsValidados = z.array(esquemaItem).min(1).safeParse(itemsCrudos);
  if (!itemsValidados.success) {
    return { ok: false, mensaje: "Tu pedido está vacío." };
  }
  const items = itemsValidados.data;

  const supabase = createAdminClient();
  const ajustes = await leerAjustes(supabase);

  // El método de pago tiene que estar habilitado en el panel.
  if (formulario.pago === "mercadopago" && !esVerdadero(ajustes.pago_mercadopago_activo)) {
    return { ok: false, mensaje: "El pago con Mercado Pago no está disponible." };
  }
  if (
    formulario.pago === "transfer" &&
    ajustes.pago_transferencia_activo !== undefined &&
    !esVerdadero(ajustes.pago_transferencia_activo || "true")
  ) {
    return { ok: false, mensaje: "El pago por transferencia no está disponible." };
  }

  // --- Recalculamos TODOS los precios en el servidor ----------------------
  // Nunca se confía en los precios que llegan del navegador.
  const idsProductos = items.filter((i) => i.tipo === "product").map((i) => i.id);
  const idsCombos = items.filter((i) => i.tipo === "combo").map((i) => i.id);

  const [respProductos, respCombos, respOfertas] = await Promise.all([
    idsProductos.length
      ? supabase
          .from("products")
          .select("id, name, price, category_id, is_active, stock, track_stock")
          .in("id", idsProductos)
      : Promise.resolve({ data: [], error: null }),
    idsCombos.length
      ? supabase.from("combos").select("id, name, price, is_active").in("id", idsCombos)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("offers").select("*").eq("is_active", true),
  ]);

  if (respProductos.error || respCombos.error || respOfertas.error) {
    return { ok: false, mensaje: "No pudimos leer el catálogo. Probá de nuevo." };
  }

  const ofertas = (respOfertas.data ?? []).map((o) => ({
    ...o,
    value: Number(o.value),
  })) as Offer[];

  type LineaPedido = Omit<OrderItem, "id" | "order_id">;
  const lineas: LineaPedido[] = [];
  const bajasDeStock: { id: string; nuevo: number }[] = [];

  let itemsTotal = 0;
  let descuentoTotal = 0;

  for (const item of items) {
    if (item.tipo === "product") {
      const producto = (respProductos.data ?? []).find((p) => p.id === item.id);
      if (!producto || !producto.is_active) {
        return {
          ok: false,
          mensaje: "Uno de los productos ya no está disponible. Revisá tu pedido.",
        };
      }

      if (producto.track_stock && producto.stock < item.cantidad) {
        return {
          ok: false,
          mensaje: `Nos queda${producto.stock === 1 ? "" : "n"} ${producto.stock} de ${producto.name}. Ajustá la cantidad.`,
        };
      }

      const precio = calcularPrecio(
        {
          id: producto.id,
          category_id: producto.category_id,
          price: Number(producto.price),
        },
        ofertas,
      );

      itemsTotal += precio.lista * item.cantidad;
      descuentoTotal += precio.descuento * item.cantidad;

      lineas.push({
        kind: "product",
        product_id: producto.id,
        combo_id: null,
        name: producto.name,
        unit_price: precio.final,
        quantity: item.cantidad,
        subtotal: precio.final * item.cantidad,
      });

      if (producto.track_stock) {
        bajasDeStock.push({ id: producto.id, nuevo: producto.stock - item.cantidad });
      }
    } else {
      const combo = (respCombos.data ?? []).find((c) => c.id === item.id);
      if (!combo || !combo.is_active) {
        return {
          ok: false,
          mensaje: "Uno de los combos ya no está disponible. Revisá tu pedido.",
        };
      }

      const precio = Number(combo.price);
      itemsTotal += precio * item.cantidad;

      lineas.push({
        kind: "combo",
        product_id: null,
        combo_id: combo.id,
        name: combo.name,
        unit_price: precio,
        quantity: item.cantidad,
        subtotal: precio * item.cantidad,
      });
    }
  }

  const subtotal = itemsTotal - descuentoTotal;

  const pedidoMinimo = aNumero(ajustes.pedido_minimo);
  if (pedidoMinimo > 0 && subtotal < pedidoMinimo) {
    return { ok: false, mensaje: `El pedido mínimo es de $${pedidoMinimo}.` };
  }

  const envioGratisDesde = aNumero(ajustes.envio_gratis_desde);
  const envio =
    formulario.entrega === "pickup"
      ? 0
      : envioGratisDesde > 0 && subtotal >= envioGratisDesde
        ? 0
        : aNumero(ajustes.envio_costo);

  const total = subtotal + envio;

  // --- Guardamos el pedido -------------------------------------------------
  const usuario = await getUsuario();
  const codigo = generarCodigoPedido();
  const token = tokenAleatorio(28);

  const { data: pedido, error: errorPedido } = await supabase
    .from("orders")
    .insert({
      code: codigo,
      access_token: token,
      user_id: usuario?.id ?? null,
      customer_name: formulario.nombre,
      customer_phone: formulario.telefono,
      customer_email: formulario.email || usuario?.email || null,
      delivery_type: formulario.entrega,
      address_street: formulario.entrega === "delivery" ? formulario.calle : null,
      address_number: formulario.entrega === "delivery" ? formulario.numero : null,
      address_apartment: formulario.piso || null,
      address_city: formulario.entrega === "delivery" ? formulario.ciudad : null,
      address_zone: formulario.barrio || null,
      address_notes: formulario.indicaciones || null,
      payment_method: formulario.pago,
      status: "pendiente_pago",
      items_total: itemsTotal,
      discount_total: descuentoTotal,
      shipping_total: envio,
      total,
      notes: formulario.notas || null,
    })
    .select("id, code, access_token")
    .single();

  if (errorPedido || !pedido) {
    return { ok: false, mensaje: "No pudimos registrar el pedido. Probá de nuevo." };
  }

  const { error: errorItems } = await supabase
    .from("order_items")
    .insert(lineas.map((linea) => ({ ...linea, order_id: pedido.id })));

  if (errorItems) {
    // Si fallan los items, el pedido queda inconsistente: lo borramos.
    await supabase.from("orders").delete().eq("id", pedido.id);
    return { ok: false, mensaje: "No pudimos guardar el detalle. Probá de nuevo." };
  }

  // Reservamos el stock de los productos que lo llevan controlado.
  for (const baja of bajasDeStock) {
    await supabase.from("products").update({ stock: baja.nuevo }).eq("id", baja.id);
  }

  // Guardamos la dirección en la cuenta si el usuario lo pidió.
  if (usuario && formulario.guardarDireccion && formulario.entrega === "delivery") {
    await supabase.from("addresses").insert({
      user_id: usuario.id,
      label: formulario.barrio || "Mi casa",
      street: formulario.calle,
      number: formulario.numero,
      apartment: formulario.piso || null,
      city: formulario.ciudad,
      zone: formulario.barrio || null,
      notes: formulario.indicaciones || null,
    });
  }

  revalidatePath("/admin/pedidos");

  const urlPedido = `/pedido/${pedido.code}?t=${pedido.access_token}`;

  // --- Mercado Pago --------------------------------------------------------
  if (formulario.pago === "mercadopago") {
    const enlace = await crearPreferencia({
      pedidoId: pedido.id,
      codigo: pedido.code,
      token: pedido.access_token,
      lineas,
      envio,
      email: formulario.email || usuario?.email || undefined,
    });

    if (enlace) return { ok: true, url: enlace };

    // Si Mercado Pago falla, el pedido igual quedó tomado: seguimos por el
    // flujo de transferencia para no perder la venta.
    await supabase
      .from("orders")
      .update({ payment_method: "transfer" })
      .eq("id", pedido.id);
  }

  return { ok: true, url: urlPedido };
}

type DatosPreferencia = {
  pedidoId: string;
  codigo: string;
  token: string;
  lineas: Omit<OrderItem, "id" | "order_id">[];
  envio: number;
  email?: string;
};

/** Crea la preferencia de Checkout Pro y devuelve el link de pago. */
async function crearPreferencia(datos: DatosPreferencia): Promise<string | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const sitio = process.env.NEXT_PUBLIC_SITE_URL;
  if (!accessToken || !sitio) return null;

  try {
    const { MercadoPagoConfig, Preference } = await import("mercadopago");
    const cliente = new MercadoPagoConfig({ accessToken });
    const preferencia = new Preference(cliente);

    const volverA = `${sitio}/pedido/${datos.codigo}?t=${datos.token}`;

    const respuesta = await preferencia.create({
      body: {
        items: [
          ...datos.lineas.map((linea) => ({
            id: linea.product_id ?? linea.combo_id ?? linea.name,
            title: linea.name,
            quantity: linea.quantity,
            unit_price: Number(linea.unit_price),
            currency_id: "ARS",
          })),
          ...(datos.envio > 0
            ? [
                {
                  id: "envio",
                  title: "Envío a domicilio",
                  quantity: 1,
                  unit_price: datos.envio,
                  currency_id: "ARS",
                },
              ]
            : []),
        ],
        payer: datos.email ? { email: datos.email } : undefined,
        external_reference: datos.pedidoId,
        statement_descriptor: "NAHILEN",
        back_urls: { success: volverA, pending: volverA, failure: volverA },
        auto_return: "approved",
        notification_url: `${sitio}/api/mercadopago/webhook`,
      },
    });

    return respuesta.init_point ?? null;
  } catch (error) {
    console.error("[mercadopago] no se pudo crear la preferencia", error);
    return null;
  }
}

/** Sube el comprobante de transferencia desde la página del pedido. */
export async function subirComprobante(
  _anterior: { ok: boolean; mensaje: string } | null,
  datos: FormData,
): Promise<{ ok: boolean; mensaje: string }> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, mensaje: "El sitio no está conectado a la base de datos." };
  }

  const codigo = String(datos.get("codigo") ?? "");
  const token = String(datos.get("token") ?? "");
  const archivo = datos.get("archivo");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, mensaje: "Elegí una imagen o un PDF del comprobante." };
  }

  if (archivo.size > 8 * 1024 * 1024) {
    return { ok: false, mensaje: "El archivo es muy grande (máximo 8 MB)." };
  }

  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!tiposPermitidos.includes(archivo.type)) {
    return { ok: false, mensaje: "Solo aceptamos imágenes (JPG, PNG, WEBP) o PDF." };
  }

  const supabase = createAdminClient();

  const { data: pedido } = await supabase
    .from("orders")
    .select("id, code, access_token")
    .eq("code", codigo)
    .maybeSingle();

  if (!pedido || pedido.access_token !== token) {
    return { ok: false, mensaje: "No encontramos ese pedido." };
  }

  const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ruta = `${pedido.code}/${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("comprobantes")
    .upload(ruta, archivo, { contentType: archivo.type, upsert: false });

  if (errorSubida) {
    console.error("[comprobante] falló la subida a Storage", {
      pedido: pedido.code,
      mensaje: errorSubida.message,
      detalle: errorSubida,
    });
    return { ok: false, mensaje: "No pudimos subir el archivo. Probá de nuevo." };
  }

  await supabase
    .from("orders")
    .update({ receipt_path: ruta, status: "comprobante_enviado" })
    .eq("id", pedido.id);

  revalidatePath(`/pedido/${pedido.code}`);
  revalidatePath("/admin/pedidos");

  return {
    ok: true,
    mensaje: "¡Recibimos tu comprobante! Te confirmamos el pedido por WhatsApp.",
  };
}
