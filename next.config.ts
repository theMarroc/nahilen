import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // El proyecto vive en una subcarpeta del home: se lo marcamos explicitamente
  // para que Turbopack no tome como raiz la carpeta del usuario.
  turbopack: { root: import.meta.dirname },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
