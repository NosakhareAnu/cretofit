import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cretofit.vercel.app";

// Rebuild sitemap at most once per hour on Vercel
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("is_out_of_stock", false)
      .gt("quantity", 0);

    if (error || !data) {
      console.error("Sitemap: failed to fetch products", error);
      return staticRoutes;
    }

    const productRoutes: MetadataRoute.Sitemap = data.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (err) {
    console.error("Sitemap: unexpected error fetching products", err);
    return staticRoutes;
  }
}
