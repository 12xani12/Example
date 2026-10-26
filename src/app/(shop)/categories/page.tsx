import type { Metadata } from "next";
import Link from "next/link";
import { getVisibleCategories } from "@/lib/catalog";
import { PageIntro } from "@/components/Catalog";
import { mediaUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse printable greeting cards by occasion, virtual cards and printable downloads including invitations, planners, wall art and gift tags.",
  alternates: { canonical: "/categories" },
};

const GROUPS = [
  { key: "GREETING_CARDS", title: "Greeting Cards", intro: "Printable cards for every occasion — many can be personalised." },
  { key: "VIRTUAL_CARDS", title: "Virtual Cards", intro: "Digital cards to download and share." },
  { key: "OTHER_DOWNLOADS", title: "Other Digital Downloads", intro: "Invitations, planners, wall art and more." },
] as const;

export default async function CategoriesPage() {
  const categories = await getVisibleCategories();
  return (
    <>
      <PageIntro eyebrow="Categories" title="Shop by Category" intro="Find exactly what you're looking for, from birthday cards to weekly planners." />
      <div className="container-page space-y-16 py-14">
        {GROUPS.map((g) => {
          const items = categories.filter((c) => c.group === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} aria-labelledby={`g-${g.key}`}>
              <h2 id={`g-${g.key}`} className="text-4xl">{g.title}</h2>
              <p className="mt-2 text-charcoal-soft">{g.intro}</p>
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((c) => (
                  <li key={c.id}>
                    <Link href={`/category/${c.slug}`} className="group flex items-center gap-4 rounded-2xl bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
                      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                        {c.imageKey && <img src={mediaUrl(`${c.imageKey}-sm.webp`)!} alt="" loading="lazy" className="h-full w-full object-cover" />}
                      </span>
                      <span className="font-serif text-lg leading-tight group-hover:text-rose-deep">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
