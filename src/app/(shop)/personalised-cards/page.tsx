import type { Metadata } from "next";
import Link from "next/link";
import { Catalog, PageIntro } from "@/components/Catalog";
import type { ShopQuery } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personalised Printable Cards",
  description: "Add your own message inside a beautiful printable greeting card. Preview it live, then download a print-ready PDF instantly.",
  alternates: { canonical: "/personalised-cards" },
};

export default async function PersonalisedPage({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const query = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="Personalised cards"
        title="Your Words, Beautifully Printed"
        intro="Choose a design, type your message for the inside, pick a font and see a live preview. We'll create a print-ready PDF with your message the moment you check out."
      >
        <ol className="mx-auto mt-8 grid max-w-3xl gap-3 text-left text-[15px] sm:grid-cols-3">
          {["Pick a card marked “Personalise me”", "Add your message and preview it", "Check out and download your PDF"].map((s, i) => (
            <li key={s} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-soft">
              <span className="font-script text-3xl text-rose-deep">{i + 1}</span> {s}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-charcoal-soft">
          The front artwork stays exactly as designed — only the inside message is personalised. <Link href="/how-it-works" className="link">How it works</Link>
        </p>
      </PageIntro>
      <div className="container-page py-12">
        <Catalog basePath="/personalised-cards" query={query} fixed={{ option: "personalised" }} hide={["option"]} />
      </div>
    </>
  );
}
