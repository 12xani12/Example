import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/cart", "/checkout", "/orders/", "/account", "/newsletter/"] }],
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
