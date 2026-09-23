-- ===========================================================================
-- Nahilén — esquema completo de la base de datos
-- ---------------------------------------------------------------------------
-- Como usarlo:
--   1. Entrá a https://supabase.com/dashboard  ->  tu proyecto
--   2. Menú lateral  ->  SQL Editor  ->  New query
--   3. Pegá TODO este archivo y apretá Run
--
-- El script es idempotente: se puede volver a correr sin romper nada.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfiles de usuario
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Devuelve true si el usuario logueado es administrador.
-- SECURITY DEFINER para que las politicas RLS no entren en recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Crea el perfil automaticamente cuando alguien se registra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogo
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  long_description text,
  category_id uuid references public.categories on delete set null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  unit text,
  stock integer not null default 0,
  track_stock boolean not null default false,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id);

-- ---------------------------------------------------------------------------
-- Ofertas y combos
-- ---------------------------------------------------------------------------

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  value numeric(12, 2) not null default 0 check (value >= 0),
  scope text not null default 'all' check (scope in ('all', 'category', 'product')),
  category_id uuid references public.categories on delete cascade,
  product_id uuid references public.products on delete cascade,
  label text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);

create index if not exists combo_items_combo_idx on public.combo_items (combo_id);

-- Historial de aumentos de precio (para poder auditar y volver atras)
create table if not exists public.price_changes (
  id uuid primary key default gen_random_uuid(),
  -- batch_id agrupa todos los cambios de un mismo aumento masivo,
  -- para poder deshacerlo completo desde el panel.
  batch_id uuid not null default gen_random_uuid(),
  product_id uuid references public.products on delete set null,
  product_name text,
  old_price numeric(12, 2),
  new_price numeric(12, 2),
  reason text,
  reverted_at timestamptz,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists price_changes_batch_idx on public.price_changes (batch_id);

-- ---------------------------------------------------------------------------
-- Contenido editable del sitio
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.sections (
  key text primary key,
  label text not null,
  description text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.benefits (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'hoja',
  title text not null unique,
  subtitle text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Direcciones de entrega
-- ---------------------------------------------------------------------------

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  label text not null default 'Mi casa',
  street text not null,
  number text not null,
  apartment text,
  city text not null,
  zone text,
  postal_code text,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  access_token text not null,
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_type text not null default 'delivery' check (delivery_type in ('delivery', 'pickup')),
  address_street text,
  address_number text,
  address_apartment text,
  address_city text,
  address_zone text,
  address_notes text,
  payment_method text not null default 'transfer' check (payment_method in ('mercadopago', 'transfer')),
  status text not null default 'pendiente_pago' check (
    status in (
      'pendiente_pago',
      'comprobante_enviado',
      'pagado',
      'en_preparacion',
      'entregado',
      'cancelado'
    )
  ),
  items_total numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  shipping_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  receipt_path text,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  kind text not null default 'product' check (kind in ('product', 'combo')),
  product_id uuid references public.products on delete set null,
  combo_id uuid references public.combos on delete set null,
  name text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  subtotal numeric(12, 2) not null default 0
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  for t in
    select unnest(array['categories', 'products', 'offers', 'combos', 'orders', 'settings'])
  loop
    execute format('drop trigger if exists set_updated_at_%1$s on public.%1$s', t);
    execute format(
      'create trigger set_updated_at_%1$s before update on public.%1$s
         for each row execute function public.set_updated_at()', t
    );
  end loop;
end
$$;

-- Nadie puede darse permisos de administrador a si mismo desde el navegador:
-- el cambio de `is_admin` solo pasa desde el SQL Editor o el backend.
create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_user not in ('postgres', 'service_role', 'supabase_admin')
  then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_admin_trigger on public.profiles;
create trigger protect_is_admin_trigger
  before update on public.profiles
  for each row execute function public.protect_is_admin();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.offers enable row level security;
alter table public.combos enable row level security;
alter table public.combo_items enable row level security;
alter table public.price_changes enable row level security;
alter table public.settings enable row level security;
alter table public.sections enable row level security;
alter table public.benefits enable row level security;
alter table public.faqs enable row level security;
alter table public.gallery_images enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- --- Perfiles --------------------------------------------------------------
drop policy if exists "perfil propio visible" on public.profiles;
create policy "perfil propio visible" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- El trigger `protect_is_admin` impide que alguien se auto-asigne el panel.
drop policy if exists "perfil propio editable" on public.profiles;
create policy "perfil propio editable" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- --- Contenido publico de lectura -----------------------------------------
-- Lectura abierta (el sitio es publico); escritura solo para la administradora.

drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categorias administrables" on public.categories;
create policy "categorias administrables" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "productos visibles" on public.products;
create policy "productos visibles" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "productos administrables" on public.products;
create policy "productos administrables" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "imagenes visibles" on public.product_images;
create policy "imagenes visibles" on public.product_images for select using (true);

drop policy if exists "imagenes administrables" on public.product_images;
create policy "imagenes administrables" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ofertas visibles" on public.offers;
create policy "ofertas visibles" on public.offers
  for select using (is_active or public.is_admin());

drop policy if exists "ofertas administrables" on public.offers;
create policy "ofertas administrables" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "combos visibles" on public.combos;
create policy "combos visibles" on public.combos
  for select using (is_active or public.is_admin());

drop policy if exists "combos administrables" on public.combos;
create policy "combos administrables" on public.combos
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items de combo visibles" on public.combo_items;
create policy "items de combo visibles" on public.combo_items for select using (true);

drop policy if exists "items de combo administrables" on public.combo_items;
create policy "items de combo administrables" on public.combo_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ajustes visibles" on public.settings;
create policy "ajustes visibles" on public.settings for select using (true);

drop policy if exists "ajustes administrables" on public.settings;
create policy "ajustes administrables" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "secciones visibles" on public.sections;
create policy "secciones visibles" on public.sections for select using (true);

drop policy if exists "secciones administrables" on public.sections;
create policy "secciones administrables" on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "beneficios visibles" on public.benefits;
create policy "beneficios visibles" on public.benefits
  for select using (is_active or public.is_admin());

drop policy if exists "beneficios administrables" on public.benefits;
create policy "beneficios administrables" on public.benefits
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs visibles" on public.faqs;
create policy "faqs visibles" on public.faqs
  for select using (is_active or public.is_admin());

drop policy if exists "faqs administrables" on public.faqs;
create policy "faqs administrables" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "galeria visible" on public.gallery_images;
create policy "galeria visible" on public.gallery_images
  for select using (is_active or public.is_admin());

drop policy if exists "galeria administrable" on public.gallery_images;
create policy "galeria administrable" on public.gallery_images
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Newsletter ------------------------------------------------------------
drop policy if exists "cualquiera se suscribe" on public.newsletter_subscribers;
create policy "cualquiera se suscribe" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "suscriptores solo admin" on public.newsletter_subscribers;
create policy "suscriptores solo admin" on public.newsletter_subscribers
  for select using (public.is_admin());

-- --- Historial de precios --------------------------------------------------
drop policy if exists "historial solo admin" on public.price_changes;
create policy "historial solo admin" on public.price_changes
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Direcciones -----------------------------------------------------------
drop policy if exists "direcciones propias" on public.addresses;
create policy "direcciones propias" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- --- Pedidos ---------------------------------------------------------------
-- Los pedidos se CREAN desde el servidor (service_role), asi los precios
-- siempre se calculan en el backend y no se pueden falsear desde el navegador.
drop policy if exists "pedidos propios" on public.orders;
create policy "pedidos propios" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pedidos administrables" on public.orders;
create policy "pedidos administrables" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items de pedido propios" on public.order_items;
create policy "items de pedido propios" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ===========================================================================
-- Storage: imagenes de productos (publico) y comprobantes (privado)
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

-- Los comprobantes se suben desde el navegador con una URL firmada (no pasan
-- por el servidor de la app), así que el límite lo pone el propio bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes', 'comprobantes', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagenes de productos publicas" on storage.objects;
create policy "imagenes de productos publicas" on storage.objects
  for select using (bucket_id = 'productos');

drop policy if exists "subir imagenes de productos" on storage.objects;
create policy "subir imagenes de productos" on storage.objects
  for insert with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "borrar imagenes de productos" on storage.objects;
create policy "borrar imagenes de productos" on storage.objects
  for delete using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "comprobantes solo admin" on storage.objects;
create policy "comprobantes solo admin" on storage.objects
  for select using (bucket_id = 'comprobantes' and public.is_admin());

-- ===========================================================================
-- Datos iniciales
-- ===========================================================================

-- Secciones de la portada que se pueden prender y apagar desde el panel
insert into public.sections (key, label, description, sort_order) values
  ('hero',             'Portada principal',      'Imagen grande, título y botón de la primera pantalla.', 1),
  ('barra_beneficios', 'Barra de beneficios',    'La tira con Hecho a mano, Envíos, etc.',            2),
  ('categorias',       'Categorías',             'Las tarjetas con mermeladas, budines, etc.',            3),
  ('destacados',       'Productos destacados',   'Los productos marcados como destacados.',               4),
  ('ofertas',          'Ofertas vigentes',       'Productos con descuento activo.',                       5),
  ('combos',           'Combos',                 'Los combos armados desde el panel.',                    6),
  ('carrusel',         'Carrusel de fotos',      'Galería de fotos que se desliza sola.',                 7),
  ('frase',            'Franja con la frase',    'La banda amarilla con la frase de la marca.',           8),
  ('mapa_delivery',    'Zona de entrega',        'Texto y mapa de la zona donde se entrega.',             9),
  ('faq',              'Preguntas frecuentes',   'El acordeón de preguntas y respuestas.',               10),
  ('newsletter',       'Newsletter',             'El formulario para dejar el mail.',                    11)
on conflict (key) do nothing;

insert into public.benefits (icon, title, subtitle, sort_order) values
  ('corazon', 'Hecho a mano',   'con amor',        1),
  ('caja',    'Entregas',       'a domicilio',     2),
  ('hoja',    'Ingredientes',   'naturales',       3),
  ('persona', 'Atención',       'personalizada',   4)
on conflict (title) do nothing;

insert into public.faqs (question, answer, sort_order) values
  ('¿Cuánto duran las mermeladas?',
   'Cerradas duran 8 meses en un lugar fresco y seco. Una vez abiertas, en la heladera, hasta 3 semanas.', 1),
  ('¿Cómo puedo pagar?',
   'Por transferencia bancaria o con Mercado Pago. Si elegís transferencia te pedimos el comprobante para confirmar el pedido.', 2),
  ('¿Hacen envíos?',
   'Sí, entregamos a domicilio en la zona. Al hacer el pedido cargás tu dirección y coordinamos el día por WhatsApp.', 3),
  ('¿Puedo encargar para un regalo?',
   'Claro. Armamos cajas y canastas con lo que quieras e incluimos una tarjetita escrita a mano.', 4)
on conflict (question) do nothing;

insert into public.categories (slug, name, description, sort_order) values
  ('mermeladas',   'Mermeladas',   'Fruta de estación cocinada en tandas chicas.', 1),
  ('budines',      'Budines',      'Húmedos, caseros y recién horneados.',         2),
  ('para-regalar', 'Para regalar', 'Cajas y canastas armadas a mano.',             3)
on conflict (slug) do nothing;

insert into public.products (slug, name, description, price, unit, category_id, is_featured, sort_order)
select
  d.slug, d.name, d.description, d.price, d.unit,
  (select id from public.categories where slug = d.cat),
  d.featured, d.orden
from (values
  ('mermelada-de-frutilla', 'Mermelada de frutilla', 'Frasco de 250 g. Fruta y azúcar, nada más.', 4800, '250 g', 'mermeladas', true, 1),
  ('mermelada-de-durazno',  'Mermelada de durazno',  'Frasco de 250 g. Dulce y suave.',            4500, '250 g', 'mermeladas', true, 2),
  ('mermelada-de-higo',     'Mermelada de higo',     'Frasco de 250 g. La favorita del verano.',   5200, '250 g', 'mermeladas', false, 3),
  ('budin-de-limon',        'Budín de limón',        'Con glasé de limón natural.',                7200, 'unidad', 'budines',    true, 1),
  ('budin-marmolado',       'Budín marmolado',       'Vainilla y chocolate.',                      6900, 'unidad', 'budines',    false, 2)
) as d(slug, name, description, price, unit, cat, featured, orden)
on conflict (slug) do nothing;

-- ===========================================================================
-- ULTIMO PASO (importante)
-- ---------------------------------------------------------------------------
-- 1. Creá el usuario de tu prima en Authentication -> Users -> Add user
--    (con email y contraseña, marcando Auto Confirm User).
-- 2. Volvé acá, reemplazá el mail y corré esta línea para darle el panel:
--
--      update public.profiles set is_admin = true
--      where id = (select id from auth.users where email = 'MAIL@EJEMPLO.COM');
--
-- ===========================================================================
