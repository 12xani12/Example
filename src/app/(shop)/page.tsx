import Link from "next/link";
import { prisma } from "@/lib/db";
import { getHomepageSettings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage";
import { productInclude, toCardData } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ArrowRight, DownloadIcon, PrinterIcon, SparkleIcon, TagIcon, EditIcon, CardIcon, SmileIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { Icon: DownloadIcon, title: "Instant Download", text: "Get your files straight after purchase." },
  { Icon: TagIcon, title: "Affordable", text: "Beautiful designs at great prices." },
  { Icon: PrinterIcon, title: "Print at Home", text: "Easy, convenient and ready when you are." },
  { Icon: SparkleIcon, title: "Perfect for Any Occasion", text: "Birthdays, celebrations and more." },
];

const STEPS = [
  { Icon: CardIcon, title: "Choose", text: "Browse the collection and select your favourite design." },
  { Icon: EditIcon, title: "Personalise", text: "Add your own message if you wish." },
  { Icon: DownloadIcon, title: "Purchase & Download", text: "Complete checkout and instantly access your files." },
  { Icon: SmileIcon, title: "Print or Send", text: "Print at home or share a digital card with someone special." },
];

function tileImage(key: string | null) {
  return key ? mediaUrl(`${key}-sm.webp`) : null;
}

export default async function HomePage() {
  const [home, occasionCats, moreCats, featured] = await Promise.all([
    getHomepageSettings(),
    prisma.category.findMany({ where: { showOnHome: true, isHidden: false, group: { in: ["GREETING_CARDS", "VIRTUAL_CARDS"] } }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { showOnHome: true, isHidden: false, group: "OTHER_DOWNLOADS" }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { status: "PUBLISHED", isFeatured: true }, include: productInclude, orderBy: { sortOrder: "asc" }, take: 8 }),
  ]);
  const seasonal = home.seasonalCategorySlug
    ? await prisma.category.findFirst({
        where: { slug: home.seasonalCategorySlug, isHidden: false },
        include: { products: { where: { product: { status: "PUBLISHED" } }, include: { product: { include: productInclude } }, take: 4 } },
      })
    : null;
  const heroImg = home.heroImageKey ? mediaUrl(`${home.heroImageKey}-lg.webp`) : null;
  const promoImg = home.promoImageKey ? mediaUrl(`${home.promoImageKey}-lg.webp`) : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush via-blush-light to-cream">
        <div className="container-page grid items-center gap-6 pb-10 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-4 lg:pb-16 lg:pt-16">
          <div className="relative z-10 max-w-xl animate-fade-up text-center lg:text-left">
            <p className="eyebrow">Small Cards. Big Moments.</p>
            <h1 className="mt-4 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">{home.heroHeading}</h1>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-charcoal-soft lg:mx-0">{home.heroText}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href={home.heroButtonHref || "/shop"} className="btn-primary px-8 py-4">
                {home.heroButtonLabel} <ArrowRight size={18} />
              </Link>
              <Link href="/personalised-cards" className="btn-secondary px-6 py-4">Personalise a card</Link>
            </div>
          </div>
          <div className="relative -mx-4 animate-fade-in sm:mx-0" style={{ animationDelay: "150ms" }}>
            {heroImg ? (
              <img src={heroImg} alt="Printable Cardly greeting cards arranged with envelopes and fresh flowers" className="mx-auto w-full max-w-[720px]" width={1400} height={1100} fetchPriority="high" />
            ) : (
              <div className="aspect-[14/11] w-full" />
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-label="Why Cardly" className="border-b border-charcoal/5 bg-white">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-8 py-10 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
                <Icon size={26} />
              </span>
              <div className="mt-3 lg:mt-1">
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-1 text-[14px] leading-snug text-charcoal-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop by occasion */}
      <section className="py-16 sm:py-20" aria-labelledby="occasion-heading">
        <div className="container-page">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="occasion-heading" eyebrow="Find the perfect card" title="Shop by Occasion" align="left" />
            <Link href="/categories" className="link text-sm uppercase tracking-[0.14em]">View all</Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {occasionCats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-peach shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
                    {tileImage(c.imageKey) && <img src={tileImage(c.imageKey)!} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <p className="mt-3 text-center font-serif text-xl group-hover:text-rose-deep">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-white py-16 sm:py-20" aria-labelledby="featured-heading">
          <div className="container-page">
            <SectionHeading id="featured-heading" eyebrow="Customer favourites" title={home.featuredHeading} />
            <div className="mt-12">
              <ProductGrid products={featured.map(toCardData)} />
            </div>
            <div className="mt-12 text-center">
              <Link href="/shop" className="btn-secondary">Shop all designs <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal collection (managed in admin) */}
      {seasonal && seasonal.products.length > 0 && (
        <section className="bg-peach-light py-16 sm:py-20" aria-labelledby="seasonal-heading">
          <div className="container-page">
            <SectionHeading id="seasonal-heading" eyebrow="Seasonal collection" title={home.seasonalHeading || seasonal.name} intro={home.seasonalText || seasonal.description || undefined} />
            <div className="mt-12">
              <ProductGrid products={seasonal.products.map((p) => toCardData(p.product))} />
            </div>
            <div className="mt-10 text-center">
              <Link href={`/category/${seasonal.slug}`} className="link text-sm uppercase tracking-[0.14em]">See the full collection</Link>
            </div>
          </div>
        </section>
      )}

      {/* More than just cards */}
      <section className="bg-sage py-16 sm:py-20" aria-labelledby="more-heading">
        <div className="container-page">
          <SectionHeading id="more-heading" eyebrow="Printable downloads" title={home.moreHeading} intro={home.moreText} />
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {moreCats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card">
                  <div className="aspect-[4/3] overflow-hidden bg-cream">
                    {tileImage(c.imageKey) && <img src={tileImage(c.imageKey)!} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <p className="px-4 py-4 text-center font-serif text-xl group-hover:text-rose-deep">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20" aria-labelledby="how-heading">
        <div className="container-page">
          <SectionHeading id="how-heading" eyebrow="How it works" title="Download. Print. Make Someone Smile." />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, text }, i) => (
              <li key={title} className="card-surface relative p-7 text-center">
                <span className="absolute left-5 top-4 font-script text-4xl text-rose/60">{i + 1}</span>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peach text-rose-deep">
                  <Icon size={28} />
                </span>
                <h3 className="mt-4 text-2xl">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-charcoal-soft">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center">
            <Link href="/how-it-works" className="link text-sm">Learn more about how Cardly works</Link>
          </p>
        </div>
      </section>

      {/* Promo banner */}
      <section className="pb-16 sm:pb-20" aria-labelledby="promo-heading">
        <div className="container-page">
          <div className="relative grid items-center overflow-hidden rounded-[2rem] bg-gradient-to-r from-sage via-cream to-blush lg:grid-cols-2">
            <div className="relative z-10 p-8 text-center sm:p-12 lg:p-16 lg:text-left">
              <p className="eyebrow">Cardly</p>
              <h2 id="promo-heading" className="mt-3 text-5xl leading-tight sm:text-6xl">{home.promoHeading}</h2>
              {home.promoText && <p className="mt-4 text-lg text-charcoal-soft">{home.promoText}</p>}
              <Link href={home.promoButtonHref || "/shop"} className="btn-primary mt-8 px-8 py-4">
                {home.promoButtonLabel} <ArrowRight size={18} />
              </Link>
            </div>
            {promoImg && <img src={promoImg} alt="Greeting cards, envelopes and flowers" loading="lazy" className="w-full" width={1000} height={700} />}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-blush py-16 sm:py-20" aria-labelledby="newsletter-heading">
        <div className="container-page max-w-2xl text-center">
          <p className="eyebrow">Join the Cardly list</p>
          <h2 id="newsletter-heading" className="mt-3 text-4xl sm:text-5xl">Be the first to know</h2>
          <p className="mx-auto mt-4 max-w-lg text-[17px] text-charcoal-soft">
            New designs, special offers, seasonal releases and the occasional discount code — straight to your inbox.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
