# Nahilén — tienda online

Tienda de mermeladas y budines artesanales, con panel de administración para
gestionar el catálogo, las ofertas, los pedidos y el contenido del sitio.

Todo el stack es **gratis**: Next.js en Vercel + Supabase (base de datos, login
y almacenamiento de imágenes). No hace falta comprar dominio: queda publicada en
una dirección `algo.vercel.app`.

---

## Qué puede hacer la administradora

| Sección del panel | Para qué sirve |
|---|---|
| **Resumen** | Pedidos por revisar, productos sin stock y avisos de lo que falta configurar. |
| **Pedidos** | Ver cada pedido, abrir el comprobante de transferencia y cambiar el estado. |
| **Productos** | Cargar productos con fotos, precio, presentación, stock y descripción. |
| **Categorías** | Agrupar el catálogo (mermeladas, budines, para regalar…). |
| **Combos** | Armar packs de varios productos a un precio especial. |
| **Ofertas** | Descuentos por porcentaje o monto fijo, sobre toda la tienda, una categoría o un producto, con fecha de inicio y fin. |
| **Aumentar precios** | Subir (o bajar) todos los precios un porcentaje, con vista previa, redondeo y opción de deshacer. |
| **Secciones** | Prender y apagar cada bloque de la portada (carrusel, FAQ, mapa de delivery, etc.) y reordenarlos. |
| **Textos y fotos** | Editar todos los textos del sitio, la foto de portada, la barra de beneficios, las preguntas frecuentes y el carrusel. |
| **Ajustes** | WhatsApp, redes, datos bancarios, costos de envío, zona de entrega y métodos de pago. |

Los clientes pueden comprar **sin cuenta**. Si se registran, se les guardan las
direcciones de entrega y el historial de pedidos.

---

## 1. Probarlo en tu computadora

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Sin configurar nada todavía, el sitio arranca en
**modo demostración** con productos de ejemplo, para ver cómo queda el diseño.
El panel de administración pide la base de datos: eso se configura abajo.

---

## 2. Crear la base de datos (Supabase)

1. Entrá a <https://supabase.com> y creá una cuenta gratis.
2. **New project**. Elegí un nombre, una contraseña para la base (guardala) y la
   región **South America (São Paulo)**, que es la más cercana.
3. Cuando termine de crearse, andá a **SQL Editor › New query**, pegá **todo** el
   contenido del archivo [`supabase/schema.sql`](supabase/schema.sql) y apretá
   **Run**. Eso crea las tablas, los permisos, los espacios para las imágenes y
   unos productos de ejemplo.
4. Andá a **Project Settings › API** y copiá tres valores:
   - **Project URL**
   - **anon public** (la clave pública)
   - **service_role** (la clave secreta — no se comparte con nadie)

Creá el archivo `.env.local` en la raíz del proyecto (podés copiar
`.env.example`) y completalo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Reiniciá `npm run dev`.

> `.env.local` está en el `.gitignore`: nunca se sube al repositorio.

---

## 3. Crear el usuario administrador

1. En Supabase, **Authentication › Users › Add user › Create new user**.
2. Poné el mail y la contraseña de tu prima, y **tildá "Auto Confirm User"**
   (si no, le va a pedir confirmar el mail).
3. Volvé al **SQL Editor** y corré esto, cambiando el mail:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'MAIL@EJEMPLO.COM');
```

Listo: entrando a `/ingresar` con ese mail ya ve el panel en `/admin`.

---

## 4. Publicarlo en internet (Vercel, gratis)

1. Subí el proyecto a un repositorio de GitHub.
2. Entrá a <https://vercel.com>, **Add New › Project** e importá ese repositorio.
3. En **Environment Variables** cargá las mismas cuatro variables del
   `.env.local`, pero con `NEXT_PUBLIC_SITE_URL` apuntando a la URL que te da
   Vercel (`https://nahilen.vercel.app`, por ejemplo).
4. **Deploy**.
5. Volvé a Supabase, **Authentication › URL Configuration**, y agregá esa misma
   URL en *Site URL* y en *Redirect URLs* (`https://tu-sitio.vercel.app/**`),
   para que funcionen los mails de confirmación.

Cada vez que hagas `git push`, Vercel vuelve a publicar solo.

### Mantener el proyecto de Supabase despierto

Los proyectos gratuitos de Supabase se pausan después de **7 días sin ninguna
consulta**. Con visitas normales no pasa, pero si la tienda va a estar quieta un
tiempo, entrá al panel una vez por semana o dejá configurado un ping automático.

---

## 5. Cobrar con Mercado Pago (opcional)

Sin esto, la tienda cobra por transferencia: el cliente ve el alias/CBU, sube el
comprobante y el pedido queda registrado esperando confirmación. Funciona
perfecto y no requiere ningún trámite.

Para aceptar tarjetas:

1. Entrá a <https://www.mercadopago.com.ar/developers/panel>, creá una
   aplicación y copiá el **Access Token de producción**.
2. Agregalo como variable de entorno en Vercel (y en `.env.local` si querés
   probarlo local):

   ```bash
   MP_ACCESS_TOKEN=APP_USR-...
   ```

3. Volvé a desplegar y, en el panel, **Ajustes › Cómo cobrás**, tildá
   *Cobrar con Mercado Pago*.

Cuando alguien paga, Mercado Pago avisa a `/api/mercadopago/webhook` y el pedido
pasa solo al estado **Pagado**.

> El Access Token es una credencial secreta, por eso se carga como variable de
> entorno y no desde el panel.

---

## Cómo está armado

```
src/
  app/
    (tienda)/        Páginas públicas: portada, tienda, producto, carrito,
                     checkout, pedido, cuenta del cliente
    admin/           Panel de administración (protegido)
    api/             Webhook de Mercado Pago
    auth/callback/   Confirmación de mail de Supabase
  actions/           Server Actions (todo lo que escribe en la base)
    admin/           Acciones del panel
  components/        Componentes de UI, agrupados por área
  lib/
    db.ts            Única capa de lectura del catálogo (+ modo demo)
    pricing.ts       Cálculo de precios y ofertas
    settings.ts      Textos y parámetros editables, con sus valores por defecto
    supabase/        Clientes de Supabase (navegador, servidor, service_role)
supabase/
  schema.sql         Todo el esquema, los permisos y los datos iniciales
brand/
  template_nahilen.jpeg   Guía de marca de referencia
```

### Decisiones que conviene conocer

- **Los precios se recalculan siempre en el servidor.** El carrito vive en el
  navegador, pero al confirmar el pedido se vuelven a leer los precios y las
  ofertas desde la base. Nadie puede comprar a un precio que se haya editado
  desde el navegador.
- **Los pedidos se crean con la clave `service_role`**, así no hace falta darle
  permiso de escritura a los visitantes anónimos.
- **La página del pedido se abre con un token secreto** en la URL
  (`/pedido/NAH-XXXXX?t=...`), así el cliente puede volver a verla sin tener
  cuenta y nadie puede espiar pedidos ajenos.
- **Los comprobantes van a un bucket privado.** En el panel se ven con un enlace
  firmado que vence en una hora.
- **Las ofertas no se acumulan:** si un producto entra en más de una, se aplica
  la que más le conviene al cliente.
- **Cada aumento masivo queda registrado** en `price_changes` con un
  `batch_id`, y por eso se puede deshacer completo.
- **Si Supabase no está configurado**, el sitio público funciona igual con datos
  de ejemplo (`src/lib/demo-data.ts`) y muestra un aviso.

---

## Comandos

```bash
npm run dev     # desarrollo en http://localhost:3000
npm run build   # compilar para producción (revisa tipos)
npm run start   # levantar lo compilado
npm run lint    # revisar el código
```
