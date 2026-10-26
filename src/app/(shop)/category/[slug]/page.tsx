import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Catalog, PageIntro } from "@/components/Catalog";
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
  return (
    <>
      <PageIntro eyebrow={category.group === "VIRTUAL_CARDS" ? "Virtual cards" : category.group === "OTHER_DOWNLOADS" ? "Printable downloads" : "Greeting cards"} title={category.name} intro={category.description ?? undefined}>
        <nav aria-label="Breadcrumb" className="mt-5 text-sm text-charcoal-muted">
          <Link href="/" className="hover:text-rose-deep">Home</Link> <span aria-hidden="true">/</span>{" "}
          <Link href="/categories" className="hover:text-rose-deep">Categories</Link> <span aria-hidden="true">/</span>{" "}
          <span aria-current="page">{category.name}</span>
        </nav>
      </PageIntro>
      <div className="container-page py-12">
        <Catalog basePath={`/category/${category.slug}`} query={query} fixed={{ category: category.slug }} hide={["category"]} />
      </div>
    </>
  );
}
