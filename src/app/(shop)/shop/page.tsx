import type { Metadata } from "next";
import { Catalog, PageIntro } from "@/components/Catalog";
import type { ShopQuery } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<ShopQuery> }): Promise<Metadata> {
  const q = (await searchParams).q;
  return {
    title: q ? `Search results for “${q}”` : "Shop Printable Greeting Cards & Digital Downloads",
    description: "Browse printable birthday cards, personalised cards, virtual cards, invitations, planners and more. Instant download greeting cards in AUD.",
    alternates: { canonical: "/shop" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const query = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="The Cardly shop"
        title={query.q ? `Results for “${query.q}”` : "Shop All Designs"}
        intro="Printable greeting cards, personalised cards, virtual cards and beautiful downloads — ready the moment you check out."
      />
      <div className="container-page py-12">
        <Catalog basePath="/shop" query={query} />
      </div>
    </>
  );
}
