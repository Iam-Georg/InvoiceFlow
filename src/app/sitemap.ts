import type { MetadataRoute } from "next";
import { getAllIndustrySlugs } from "@/data/industries";

const BASE_URL = "https://faktura.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/funktionen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/preise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/ueber-uns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/impressum`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/fuer`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const industrySlugs = getAllIndustrySlugs();
  const industryPages: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${BASE_URL}/fuer/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...industryPages];
}
