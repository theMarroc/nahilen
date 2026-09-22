export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  long_description: string | null;
  category_id: string | null;
  price: number;
  unit: string | null;
  stock: number;
  track_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  images: ProductImage[];
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OfferKind = "percent" | "amount";
export type OfferScope = "all" | "category" | "product";

export type Offer = {
  id: string;
  name: string;
  kind: OfferKind;
  value: number;
  scope: OfferScope;
  category_id: string | null;
  product_id: string | null;
  label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export type ComboItem = {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  product?: Pick<Product, "id" | "name" | "price" | "slug"> | null;
};

export type Combo = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  is_active: boolean;
  sort_order: number;
  items: ComboItem[];
};

export type Section = {
  key: string;
  label: string;
  description: string | null;
  is_enabled: boolean;
  sort_order: number;
};

export type Benefit = {
  id: string;
  icon: string;
  title: string;
  subtitle: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Settings = Record<string, string>;

export type Address = {
  id: string;
  user_id: string;
  label: string;
  street: string;
  number: string;
  apartment: string | null;
  city: string;
  zone: string | null;
  postal_code: string | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
};

export type PaymentMethod = "mercadopago" | "transfer";
export type DeliveryType = "delivery" | "pickup";

export type OrderStatus =
  | "pendiente_pago"
  | "comprobante_enviado"
  | "pagado"
  | "en_preparacion"
  | "entregado"
  | "cancelado";

export const ESTADOS_PEDIDO: Record<OrderStatus, { label: string; clase: string }> = {
  pendiente_pago: { label: "Esperando pago", clase: "bg-beige/60 text-marron" },
  comprobante_enviado: { label: "Comprobante enviado", clase: "bg-mostaza/40 text-marron" },
  pagado: { label: "Pagado", clase: "bg-oliva/20 text-oliva" },
  en_preparacion: { label: "En preparación", clase: "bg-terracota/20 text-terracota-oscuro" },
  entregado: { label: "Entregado", clase: "bg-oliva text-white" },
  cancelado: { label: "Cancelado", clase: "bg-carbon/10 text-carbon/60" },
};

export type OrderItem = {
  id: string;
  order_id: string;
  kind: "product" | "combo";
  product_id: string | null;
  combo_id: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  code: string;
  access_token: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_type: DeliveryType;
  address_street: string | null;
  address_number: string | null;
  address_apartment: string | null;
  address_city: string | null;
  address_zone: string | null;
  address_notes: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  items_total: number;
  discount_total: number;
  shipping_total: number;
  total: number;
  notes: string | null;
  receipt_path: string | null;
  mp_payment_id: string | null;
  created_at: string;
  items?: OrderItem[];
};

/** Resultado que devuelven los formularios del panel. */
export type EstadoAdmin = { ok: boolean; mensaje: string } | null;
