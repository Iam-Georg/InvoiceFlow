import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://faktura.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/funktionen",
          "/preise",
          "/ueber-uns",
          "/fuer/",
          "/impressum",
          "/datenschutz",
          "/docs",
        ],
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/settings",
          "/billing",
          "/support",
          "/invoices",
          "/customers",
          "/statistics",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
