import { cache } from "react";

import {
  BENEFICIOS_DEMO,
  CATEGORIAS_DEMO,
  COMBOS_DEMO,
  FAQS_DEMO,
  OFERTAS_DEMO,
  PRODUCTOS_DEMO,
  SECCIONES_DEMO,
} from "./demo-data";
import { createClient, supabaseConfigurado } from "./supabase/server";
import type {
  Benefit,
  Category,
  Combo,
  Faq,
  GalleryImage,
  Offer,
  Product,
  Section,
  Settings,
} from "./types";

/**
 * Capa única de lectura del catálogo.
 *
 * Todas las páginas públicas leen desde acá. Si Supabase todavía no está
 * configurado, se devuelven los datos de demostración para que el sitio se
 * pueda ver igual. `cache()` evita repetir la misma consulta dentro de un
 * mismo render.
 */

export const modoDemo = () => !supabaseConfigurado();

const SELECT_PRODUCTO =
  "*, images:product_images(*), category:categories(id, name, slug)";

function ordenarImagenes(producto: Product): Product {
  return {
    ...producto,
    price: Number(producto.price),
    images: [...(producto.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export const getCategorias = cache(async (incluirInactivas = false): Promise<Category[]> => {
  if (modoDemo()) {
    return CATEGORIAS_DEMO.filter((c) => incluirInactivas || c.is_active);
  }

  const supabase = await createClient();
  let consulta = supabase.from("categories").select("*").order("sort_order");
  if (!incluirInactivas) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return data ?? [];
});

export const getCategoria = cache(async (slug: string): Promise<Category | null> => {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
});

export type FiltroProductos = {
  categoria?: string;
  destacados?: boolean;
  buscar?: string;
  incluirInactivos?: boolean;
};

export const getProductos = cache(
  async (filtro: FiltroProductos = {}): Promise<Product[]> => {
    const { categoria, destacados, buscar, incluirInactivos = false } = filtro;

    if (modoDemo()) {
      const categorias = CATEGORIAS_DEMO;
      return PRODUCTOS_DEMO.filter((p) => {
        if (!incluirInactivos && !p.is_active) return false;
        if (destacados && !p.is_featured) return false;
        if (categoria) {
          const cat = categorias.find((c) => c.slug === categoria);
          if (!cat || p.category_id !== cat.id) return false;
        }
        if (buscar) {
          const texto = `${p.name} ${p.description ?? ""}`.toLowerCase();
          if (!texto.includes(buscar.toLowerCase())) return false;
        }
        return true;
      }).sort((a, b) => a.sort_order - b.sort_order);
    }

    const supabase = await createClient();
    let consulta = supabase.from("products").select(SELECT_PRODUCTO);

    if (!incluirInactivos) consulta = consulta.eq("is_active", true);
    if (destacados) consulta = consulta.eq("is_featured", true);
    if (buscar) consulta = consulta.ilike("name", `%${buscar}%`);

    if (categoria) {
      const cat = await getCategoria(categoria);
      if (!cat) return [];
      consulta = consulta.eq("category_id", cat.id);
    }

    const { data, error } = await consulta
      .order("sort_order")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`No se pudieron leer los productos: ${error.message}`);
    return (data as Product[] | null)?.map(ordenarImagenes) ?? [];
  },
);

export const getProducto = cache(async (slug: string): Promise<Product | null> => {
  if (modoDemo()) {
    return PRODUCTOS_DEMO.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUCTO)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? ordenarImagenes(data as Product) : null;
});

export const getProductoPorId = cache(async (id: string): Promise<Product | null> => {
  if (modoDemo()) {
    return PRODUCTOS_DEMO.find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT_PRODUCTO)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? ordenarImagenes(data as Product) : null;
});

export const getOfertas = cache(async (incluirInactivas = false): Promise<Offer[]> => {
  if (modoDemo()) {
    return OFERTAS_DEMO.filter((o) => incluirInactivas || o.is_active);
  }

  const supabase = await createClient();
  let consulta = supabase.from("offers").select("*").order("created_at", { ascending: false });
  if (!incluirInactivas) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer las ofertas: ${error.message}`);
  return (data ?? []).map((o) => ({ ...o, value: Number(o.value) }));
});

export const getCombos = cache(async (incluirInactivos = false): Promise<Combo[]> => {
  if (modoDemo()) {
    return COMBOS_DEMO.filter((c) => incluirInactivos || c.is_active);
  }

  const supabase = await createClient();
  let consulta = supabase
    .from("combos")
    .select("*, items:combo_items(*, product:products(id, name, price, slug))")
    .order("sort_order");
  if (!incluirInactivos) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer los combos: ${error.message}`);
  return ((data as Combo[] | null) ?? []).map((c) => ({ ...c, price: Number(c.price) }));
});

export const getCombo = cache(async (slug: string): Promise<Combo | null> => {
  const combos = await getCombos(true);
  return combos.find((c) => c.slug === slug) ?? null;
});

export const getSecciones = cache(async (): Promise<Section[]> => {
  if (modoDemo()) return SECCIONES_DEMO;

  const supabase = await createClient();
  const { data, error } = await supabase.from("sections").select("*").order("sort_order");
  if (error) throw new Error(`No se pudieron leer las secciones: ${error.message}`);
  return data?.length ? data : SECCIONES_DEMO;
});

/** Mapa {clave: activa} para preguntar rapido si una seccion se muestra. */
export const getSeccionesActivas = cache(async (): Promise<Record<string, boolean>> => {
  const secciones = await getSecciones();
  return Object.fromEntries(secciones.map((s) => [s.key, s.is_enabled]));
});

export const getAjustes = cache(async (): Promise<Settings> => {
  if (modoDemo()) return {};

  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw new Error(`No se pudieron leer los ajustes: ${error.message}`);
  return Object.fromEntries((data ?? []).map((fila) => [fila.key, fila.value ?? ""]));
});

export const getBeneficios = cache(async (incluirInactivos = false): Promise<Benefit[]> => {
  if (modoDemo()) return BENEFICIOS_DEMO;

  const supabase = await createClient();
  let consulta = supabase.from("benefits").select("*").order("sort_order");
  if (!incluirInactivos) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer los beneficios: ${error.message}`);
  return data ?? [];
});

export const getFaqs = cache(async (incluirInactivas = false): Promise<Faq[]> => {
  if (modoDemo()) return FAQS_DEMO;

  const supabase = await createClient();
  let consulta = supabase.from("faqs").select("*").order("sort_order");
  if (!incluirInactivas) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer las preguntas: ${error.message}`);
  return data ?? [];
});

export const getGaleria = cache(async (incluirInactivas = false): Promise<GalleryImage[]> => {
  if (modoDemo()) return [];

  const supabase = await createClient();
  let consulta = supabase.from("gallery_images").select("*").order("sort_order");
  if (!incluirInactivas) consulta = consulta.eq("is_active", true);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo leer la galería: ${error.message}`);
  return data ?? [];
});
