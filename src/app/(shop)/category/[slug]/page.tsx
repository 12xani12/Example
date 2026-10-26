import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Catalog } from "@/components/Catalog";
import { mediaUrl } from "@/lib/storage";
import type { ShopQuery } from "@/lib/catalog";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  return prisma.category.findFirst({ where: { slug, isHidden: false } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCategory((await params).slug);
  if (!c) return { title: "Category not found" };
  const desc = c.description || `Shop ${c.name.toLowerCase()} from Cardly — instant download, print at home. Prices in AUD.`;
  return {
    title: c.group === "OTHER_DOWNLOADS" ? `Printable ${c.name}` : c.name.includes("Card") ? `${c.name} — Printable & Personalised` : `${c.name} Cards — Printable & Personalised`,
    description: desc,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title: c.name, description: desc },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ShopQuery> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const query = await searchParams;
  const banner = category.bannerKey ? mediaUrl(`${category.bannerKey}-lg.webp`) : null;
  return (
    <>
      <section className="relative overflow-hidden bg-blush">
        {banner && <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />}
        <div className="container-page relative py-14 text-center sm:py-20">
          <h1 className="text-5xl sm:text-6xl">{category.name}</h1>
          {category.description && <p className="mx-auto mt-3 max-w-xl text-[17px] text-charcoal-soft">{category.description}</p>}
        </div>
      </section>
      <div className="container-page py-8">
        <Catalog
          basePath={`/category/${category.slug}`}
          query={query}
          fixed={{ category: category.slug }}
          hide={["category"]}
          compact
          breadcrumb={
            <nav aria-label="Breadcrumb" className="text-sm text-charcoal-muted">
              <Link href="/" className="hover:text-rose-deep">Home</Link> <span aria-hidden="true">/</span>{" "}
              <Link href="/categories" className="hover:text-rose-deep">Categories</Link> <span aria-hidden="true">/</span>{" "}
              <span aria-current="page" className="text-charcoal">{category.name}</span>
            </nav>
          }
        />
      </div>
    </>
  );
}
