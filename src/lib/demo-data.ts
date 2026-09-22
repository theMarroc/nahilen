import type { Category, Combo, Offer, Product, Section } from "./types";

/**
 * Datos de demostración.
 * Se usan únicamente cuando todavía no hay Supabase configurado, para poder
 * ver y mostrar el diseño del sitio sin haber creado la base de datos.
 * En cuanto se completan las variables de entorno, esto deja de usarse.
 */

export const CATEGORIAS_DEMO: Category[] = [
  {
    id: "cat-mermeladas",
    slug: "mermeladas",
    name: "Mermeladas",
    description: "Fruta de estación cocinada en tandas chicas.",
    image_url: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "cat-budines",
    slug: "budines",
    name: "Budines",
    description: "Húmedos, caseros y recién horneados.",
    image_url: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "cat-regalos",
    slug: "para-regalar",
    name: "Para regalar",
    description: "Cajas y canastas armadas a mano.",
    image_url: null,
    sort_order: 3,
    is_active: true,
  },
];

function producto(
  parcial: Partial<Product> & Pick<Product, "id" | "slug" | "name" | "price">,
): Product {
  return {
    description: null,
    long_description: null,
    category_id: null,
    unit: null,
    stock: 10,
    track_stock: false,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    images: [],
    category: null,
    ...parcial,
  };
}

export const PRODUCTOS_DEMO: Product[] = [
  producto({
    id: "p-1",
    slug: "mermelada-de-frutilla",
    name: "Mermelada de frutilla",
    description: "Frasco de 250 g. Fruta y azúcar, nada más.",
    long_description:
      "Frutilla de temporada cocinada a fuego bajo hasta lograr una textura espesa y brillante. Sin pectina agregada ni conservantes.",
    category_id: "cat-mermeladas",
    category: { id: "cat-mermeladas", name: "Mermeladas", slug: "mermeladas" },
    price: 4800,
    unit: "250 g",
    is_featured: true,
    sort_order: 1,
  }),
  producto({
    id: "p-2",
    slug: "mermelada-de-durazno",
    name: "Mermelada de durazno",
    description: "Frasco de 250 g. Dulce y suave.",
    category_id: "cat-mermeladas",
    category: { id: "cat-mermeladas", name: "Mermeladas", slug: "mermeladas" },
    price: 4500,
    unit: "250 g",
    is_featured: true,
    sort_order: 2,
  }),
  producto({
    id: "p-3",
    slug: "mermelada-de-higo",
    name: "Mermelada de higo",
    description: "Frasco de 250 g. Nuestra favorita del verano.",
    category_id: "cat-mermeladas",
    category: { id: "cat-mermeladas", name: "Mermeladas", slug: "mermeladas" },
    price: 5200,
    unit: "250 g",
    sort_order: 3,
  }),
  producto({
    id: "p-4",
    slug: "mermelada-de-naranja-amarga",
    name: "Mermelada de naranja amarga",
    description: "Frasco de 250 g. Con cáscara en hilos.",
    category_id: "cat-mermeladas",
    category: { id: "cat-mermeladas", name: "Mermeladas", slug: "mermeladas" },
    price: 4900,
    unit: "250 g",
    sort_order: 4,
  }),
  producto({
    id: "p-5",
    slug: "budin-de-limon",
    name: "Budín de limón",
    description: "Con glasé de limón natural.",
    long_description:
      "Budín húmedo de limón con ralladura fresca y un glasé finito que lo termina. Se conserva 5 días bien tapado.",
    category_id: "cat-budines",
    category: { id: "cat-budines", name: "Budines", slug: "budines" },
    price: 7200,
    unit: "unidad",
    is_featured: true,
    sort_order: 1,
  }),
  producto({
    id: "p-6",
    slug: "budin-marmolado",
    name: "Budín marmolado",
    description: "Vainilla y chocolate.",
    category_id: "cat-budines",
    category: { id: "cat-budines", name: "Budines", slug: "budines" },
    price: 6900,
    unit: "unidad",
    sort_order: 2,
  }),
  producto({
    id: "p-7",
    slug: "budin-de-naranja-y-nuez",
    name: "Budín de naranja y nuez",
    description: "Con nueces de la zona.",
    category_id: "cat-budines",
    category: { id: "cat-budines", name: "Budines", slug: "budines" },
    price: 7800,
    unit: "unidad",
    is_featured: true,
    sort_order: 3,
  }),
  producto({
    id: "p-8",
    slug: "caja-degustacion",
    name: "Caja degustación",
    description: "Tres frascos chicos para probar de todo.",
    category_id: "cat-regalos",
    category: { id: "cat-regalos", name: "Para regalar", slug: "para-regalar" },
    price: 11500,
    unit: "3 x 150 g",
    sort_order: 1,
  }),
];

export const OFERTAS_DEMO: Offer[] = [
  {
    id: "of-1",
    name: "15% en budines",
    kind: "percent",
    value: 15,
    scope: "category",
    category_id: "cat-budines",
    product_id: null,
    label: null,
    starts_at: null,
    ends_at: null,
    is_active: true,
  },
];

export const COMBOS_DEMO: Combo[] = [
  {
    id: "combo-1",
    slug: "desayuno-completo",
    name: "Combo desayuno",
    description: "Un budín de limón + una mermelada de frutilla.",
    image_url: null,
    price: 10900,
    is_active: true,
    sort_order: 1,
    items: [
      { id: "ci-1", combo_id: "combo-1", product_id: "p-5", quantity: 1 },
      { id: "ci-2", combo_id: "combo-1", product_id: "p-1", quantity: 1 },
    ],
  },
  {
    id: "combo-2",
    slug: "trio-de-mermeladas",
    name: "Trío de mermeladas",
    description: "Frutilla, durazno e higo en una caja de regalo.",
    image_url: null,
    price: 13200,
    is_active: true,
    sort_order: 2,
    items: [
      { id: "ci-3", combo_id: "combo-2", product_id: "p-1", quantity: 1 },
      { id: "ci-4", combo_id: "combo-2", product_id: "p-2", quantity: 1 },
      { id: "ci-5", combo_id: "combo-2", product_id: "p-3", quantity: 1 },
    ],
  },
];

export const SECCIONES_DEMO: Section[] = [
  { key: "hero", label: "Portada principal", description: null, is_enabled: true, sort_order: 1 },
  { key: "barra_beneficios", label: "Barra de beneficios", description: null, is_enabled: true, sort_order: 2 },
  { key: "categorias", label: "Categorías", description: null, is_enabled: true, sort_order: 3 },
  { key: "destacados", label: "Productos destacados", description: null, is_enabled: true, sort_order: 4 },
  { key: "ofertas", label: "Ofertas vigentes", description: null, is_enabled: true, sort_order: 5 },
  { key: "combos", label: "Combos", description: null, is_enabled: true, sort_order: 6 },
  { key: "carrusel", label: "Carrusel de fotos", description: null, is_enabled: true, sort_order: 7 },
  { key: "frase", label: "Franja con la frase", description: null, is_enabled: true, sort_order: 8 },
  { key: "mapa_delivery", label: "Zona de entrega", description: null, is_enabled: true, sort_order: 9 },
  { key: "faq", label: "Preguntas frecuentes", description: null, is_enabled: true, sort_order: 10 },
  { key: "newsletter", label: "Newsletter", description: null, is_enabled: true, sort_order: 11 },
];

export const BENEFICIOS_DEMO = [
  { id: "b-1", icon: "corazon", title: "Hecho a mano", subtitle: "con amor", sort_order: 1, is_active: true },
  { id: "b-2", icon: "caja", title: "Entregas", subtitle: "a domicilio", sort_order: 2, is_active: true },
  { id: "b-3", icon: "hoja", title: "Ingredientes", subtitle: "naturales", sort_order: 3, is_active: true },
  { id: "b-4", icon: "persona", title: "Atención", subtitle: "personalizada", sort_order: 4, is_active: true },
];

export const FAQS_DEMO = [
  {
    id: "f-1",
    question: "¿Cuánto duran las mermeladas?",
    answer:
      "Cerradas duran 8 meses en un lugar fresco y seco. Una vez abiertas, en la heladera, hasta 3 semanas.",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "f-2",
    question: "¿Cómo puedo pagar?",
    answer:
      "Por transferencia bancaria o con Mercado Pago. Si elegís transferencia, te pedimos que nos envíes el comprobante para confirmar el pedido.",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "f-3",
    question: "¿Hacen envíos?",
    answer:
      "Sí, entregamos a domicilio en la zona. Escribinos por WhatsApp con tu dirección y te confirmamos el día y el costo.",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "f-4",
    question: "¿Puedo encargar para un regalo?",
    answer:
      "Claro. Armamos cajas y canastas con lo que quieras e incluimos una tarjetita escrita a mano.",
    sort_order: 4,
    is_active: true,
  },
];
