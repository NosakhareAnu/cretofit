import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cretofit.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/login",
          "/admin/dashboard",
          "/checkout",
          "/cart",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
