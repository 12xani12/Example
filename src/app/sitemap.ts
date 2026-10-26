import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isHidden: false }, select: { slug: true, updatedAt: true } }),
  ]);
  const staticPaths = ["", "/shop", "/categories", "/personalised-cards", "/virtual-cards", "/about", "/contact", "/faqs", "/how-it-works", "/printing-instructions", "/privacy", "/terms", "/refunds", "/licence", "/cookies"];
  return [
    ...staticPaths.map((p) => ({ url: `${env.appUrl}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: `${env.appUrl}/category/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${env.appUrl}/products/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
