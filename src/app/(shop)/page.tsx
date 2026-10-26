import Link from "next/link";
import { prisma } from "@/lib/db";
import { getHomepageSettings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage";
import { productInclude, toCardData } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  ArrowRight, CalendarIcon, CardIcon, DocumentIcon, DownloadIcon, EditIcon, EnvelopeIcon, GiftIcon, HeartIcon, ImageIcon, LeafIcon, SmileIcon,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { Icon: DownloadIcon, title: "Instant Download", text: "Get your files straight after purchase." },
  { Icon: HeartIcon, title: "Affordable", text: "Beautiful designs at great prices." },
  { Icon: LeafIcon, title: "Print at Home", text: "Easy, convenient and ready when you are." },
  { Icon: GiftIcon, title: "Perfect for Any Occasion", text: "Birthdays, celebrations and more." },
];

const STEPS = [
  { Icon: CardIcon, title: "Choose", text: "Browse the collection and select your favourite design." },
  { Icon: EditIcon, title: "Personalise", text: "Add your own message if you wish." },
  { Icon: DownloadIcon, title: "Purchase & Download", text: "Complete checkout and instantly access your files." },
  { Icon: SmileIcon, title: "Print or Send", text: "Print at home or share a digital card with someone special." },
];

const POSSIBILITIES = [
  { Icon: CardIcon, label: "Cards", href: "/shop?type=GREETING_CARD" },
  { Icon: CalendarIcon, label: "Planners", href: "/category/planners" },
  { Icon: ImageIcon, label: "Wall Art", href: "/category/wall-art" },
  { Icon: EnvelopeIcon, label: "Invitations", href: "/category/invitations" },
  { Icon: GiftIcon, label: "Gift Tags", href: "/category/gift-tags" },
  { Icon: DocumentIcon, label: "Templates", href: "/category/templates" },
  { Icon: HeartIcon, label: "And More", href: "/categories" },
];

function tileImage(key: string | null) {
  return key ? mediaUrl(`${key}-sm.webp`) : null;
}

/** Small hand-drawn accents beside the hero heading. */
function Doodles() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute -top-12 left-0 hidden h-20 w-[min(36rem,100%)] text-rose sm:block" viewBox="0 0 520 80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 52c14-10 26-14 40-14M38 30l12 8-10 12" />
      <path d="M456 46c-7-6-18-3-18 6 0 8 10 14 18 21 8-7 18-13 18-21 0-9-11-12-18-6Z" />
    </svg>
  );
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
      <section className="relative overflow-hidden bg-gradient-to-r from-blush via-blush to-[#F3D3D1]">
        <div className="container-page grid items-center gap-4 pb-8 pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:pb-4 lg:pt-10">
          <div className="relative z-10 animate-fade-up py-6 text-center lg:py-16 lg:text-left">
            <Doodles />
            <h1 className="text-[2.8rem] font-medium leading-[1.05] sm:text-6xl lg:text-[4.5rem]">{home.heroHeading}</h1>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-charcoal-soft lg:mx-0 lg:text-xl">{home.heroText}</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href={home.heroButtonHref || "/shop"} className="btn-primary px-9 py-4">
                {home.heroButtonLabel} <ArrowRight size={18} />
              </Link>
              <Link href="/personalised-cards" className="text-sm text-charcoal-soft underline decoration-rose/50 underline-offset-4 hover:text-rose-deep">or personalise a card</Link>
            </div>
          </div>
          <div className="relative -mx-4 animate-fade-in sm:mx-0 lg:-mr-16" style={{ animationDelay: "150ms" }}>
            {heroImg ? (
              <img src={heroImg} alt="Printable Cardly greeting cards with kraft gift boxes and a houseplant" className="mx-auto w-full max-w-[760px]" width={1400} height={1100} fetchPriority="high" />
            ) : (
              <div className="aspect-[14/11] w-full" />
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-label="Why Cardly" className="border-b border-charcoal/5 bg-cream">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-8 py-10 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center text-center">
              <Icon size={30} strokeWidth={1.3} className="text-charcoal" />
              <h3 className="mt-3 font-sans text-[13px] font-medium uppercase tracking-[0.16em]">{title}</h3>
              <p className="mt-1 max-w-[16rem] text-[14px] leading-snug text-charcoal-soft">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Shop by occasion */}
      <section className="py-14 sm:py-16" aria-labelledby="occasion-heading">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <h2 id="occasion-heading" className="text-4xl sm:text-[2.6rem]">Shop by Occasion</h2>
            <Link href="/categories" className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-rose-deep">View All <ArrowRight size={16} /></Link>
          </div>
          <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {occasionCats.map((c) => (
              <li key={c.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[calc(20%-0.8rem)]">
                <Link href={`/category/${c.slug}`} className="group block">
                  <div className="aspect-[5/4] overflow-hidden rounded-lg bg-kraft shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
                    {tileImage(c.imageKey) && <img src={tileImage(c.imageKey)!} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <p className="mt-3 text-center text-[14px] font-medium group-hover:text-rose-deep">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-14 sm:py-16" aria-labelledby="featured-heading">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 id="featured-heading" className="text-4xl sm:text-[2.6rem]">{home.featuredHeading}</h2>
              <Link href="/shop" className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium hover:text-rose-deep">Shop All <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-8">
              <ProductGrid products={featured.map(toCardData)} />
            </div>
          </div>
        </section>
      )}

      {/* More than just cards */}
      <section className="bg-sage-mid py-14 sm:py-16" aria-labelledby="more-heading">
        <div className="container-page">
          <SectionHeading id="more-heading" title={home.moreHeading} intro={home.moreText} />
          <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
            {moreCats.map((c) => (
              <li key={c.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[calc(20%-0.8rem)]">
                <Link href={`/category/${c.slug}`} className="group block">
                  <div className="aspect-[5/4] overflow-hidden rounded-lg bg-cream shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
                    {tileImage(c.imageKey) && <img src={tileImage(c.imageKey)!} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <p className="mt-3 text-center text-[14px] font-medium group-hover:text-rose-deep">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Seasonal collection (managed in admin) */}
      {seasonal && seasonal.products.length > 0 && (
        <section className="bg-peach-light py-14 sm:py-16" aria-labelledby="seasonal-heading">
          <div className="container-page">
            <SectionHeading id="seasonal-heading" eyebrow="Seasonal collection" title={home.seasonalHeading || seasonal.name} intro={home.seasonalText || seasonal.description || undefined} />
            <div className="mt-10">
              <ProductGrid products={seasonal.products.map((p) => toCardData(p.product))} />
            </div>
            <div className="mt-10 text-center">
              <Link href={`/category/${seasonal.slug}`} className="btn-secondary">See the full collection</Link>
            </div>
          </div>
        </section>
      )}

      {/* Promo banner + how it works */}
      <section aria-labelledby="promo-heading" className="bg-[#F4E4E0]">
        <div className="grid items-center lg:grid-cols-[1.15fr_0.85fr]">
          <div className="order-2 lg:order-1">
            {promoImg && <img src={promoImg} alt="A hand-lettered card reading “Small Cards, Big Moments” beside a keyboard, coffee and flowers" loading="lazy" className="w-full" width={1100} height={700} />}
          </div>
          <div className="order-1 px-6 py-14 text-center lg:order-2 lg:py-10 lg:pr-16">
            <p className="eyebrow">Small Cards. Big Moments.</p>
            <h2 id="promo-heading" className="mx-auto mt-3 max-w-md text-[2.6rem] leading-tight sm:text-5xl">{home.promoHeading}</h2>
            <HeartIcon size={28} className="mx-auto mt-4 text-rose" />
            {home.promoText && <p className="mx-auto mt-3 max-w-sm text-lg text-charcoal-soft">{home.promoText}</p>}
            <Link href={home.promoButtonHref || "/shop"} className="btn-primary mt-6 px-10 py-4">
              {home.promoButtonLabel} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section aria-label="How it works" className="border-b border-charcoal/5 bg-white">
        <ol className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="flex gap-4">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
                <Icon size={22} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-[11px] text-white">{i + 1}</span>
              </span>
              <div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-0.5 text-[14px] leading-snug text-charcoal-soft">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Instant downloads, endless possibilities */}
      <section className="bg-gradient-to-b from-[#F7ECE8] to-cream py-14 sm:py-16" aria-labelledby="possibilities-heading">
        <div className="container-page">
          <SectionHeading id="possibilities-heading" title="Instant Downloads. Endless Possibilities." intro="Thoughtful designs for life's special moments — all in one place." />
          <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-4 gap-y-8 sm:grid-cols-7">
            {POSSIBILITIES.map(({ Icon, label, href }) => (
              <li key={label}>
                <Link href={href} className="group flex flex-col items-center gap-2.5 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush text-charcoal transition group-hover:bg-rose group-hover:text-white sm:h-[4.5rem] sm:w-[4.5rem]">
                    <Icon size={26} strokeWidth={1.3} />
                  </span>
                  <span className="text-[13px] font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-blush py-14 sm:py-16" aria-labelledby="newsletter-heading">
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
