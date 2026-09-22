import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";

import { getAjustes } from "@/lib/db";
import { ajuste } from "@/lib/settings";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const ajustes = await getAjustes();
  const nombre = ajuste(ajustes, "marca_nombre");
  const descripcion = ajuste(ajustes, "hero_texto");
  const base = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title: {
      default: `${nombre} — Mermeladas y budines artesanales`,
      template: `%s — ${nombre}`,
    },
    description: descripcion,
    ...(base ? { metadataBase: new URL(base) } : {}),
    openGraph: {
      title: `${nombre} — Mermeladas y budines artesanales`,
      description: descripcion,
      type: "website",
      locale: "es_AR",
      siteName: nombre,
    },
    icons: { icon: "/favicon.ico" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
