import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, imageSrc, purchasableVariants, relatedProducts, variantHasDeliverable, demoPurchasesAllowed } from "@/lib/catalog";
import { PRODUCT_TYPE_LABELS, FORMAT_LABELS } from "@/lib/labels";
import { formatAudShort } from "@/lib/money";
import { env } from "@/lib/env";
import { ProductGallery } from "@/components/ProductGallery";
import { PurchaseOptions } from "@/components/PurchaseOptions";
import { ProductGrid } from "@/components/ProductCard";
import { CheckIcon, DownloadIcon, LockIcon, PrinterIcon, PhoneIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const ROLE_LABELS = { FRONT: "Front cover", INSIDE: "Inside", BACK: "Back cover", LIFESTYLE: "Styled mockup", OTHER: "Preview" } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  const label = PRODUCT_TYPE_LABELS[product.type];
  const front = product.images.find((i) => i.role === "FRONT") ?? product.images[0];
  return {
    title: product.seoTitle || `${product.title} — ${label}`,
    description: product.seoDescription || `${product.shortDescription} Instant download, prices in AUD.`.slice(0, 300),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.title, description: product.shortDescription, images: front ? [imageSrc(front.key, "lg")] : undefined },
  };
}

function Section({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-charcoal/10 py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-2xl">
        {title}
        <span aria-hidden="true" className="text-rose-deep transition group-open:rotate-45">+</span>
      </summary>
      <div className="prose-cardly mt-4 text-[16px]">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await relatedProducts(product);
  const purchasable = purchasableVariants(product);
  const isVirtual = product.format === "VIRTUAL";
  const isCard = product.type === "GREETING_CARD" || product.type === "VIRTUAL_CARD";
  const options = product.variants
    .filter((v) => v.active && (v.kind === "READY_MADE" || product.template?.personalisable))
    .sort((a) => (a.kind === "READY_MADE" ? -1 : 1))
    .map((v) => ({ kind: v.kind, priceCents: v.priceCents, available: purchasable.some((p) => p.id === v.id) }));

  let unavailableReason: string | null = null;
  if (product.isDemo && !demoPurchasesAllowed()) {
    unavailableReason = "This is a sample design used to demonstrate the store. It will become available once the final product files have been added.";
  } else if (!options.some((o) => o.available)) {
    unavailableReason = product.variants.some((v) => v.active && !variantHasDeliverable(product, v.kind))
      ? "This design is being prepared and isn't ready to download yet."
      : "This design isn't available right now.";
  }

  const images = product.images.map((img) => ({
    src: imageSrc(img.key, "sm"),
    srcLg: imageSrc(img.key, "lg"),
    alt: img.alt || product.title,
    label: ROLE_LABELS[img.role],
  }));
  const prices = options.map((o) => o.priceCents);
  const category = product.categories.map((c) => c.category).find((c) => !c.isHidden);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: images.map((i) => `${env.appUrl}${i.srcLg}`),
    sku: product.id,
    brand: { "@type": "Brand", name: "Cardly" },
    category: PRODUCT_TYPE_LABELS[product.type],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AUD",
      lowPrice: (Math.min(...prices) / 100).toFixed(2),
      highPrice: (Math.max(...prices) / 100).toFixed(2),
      offerCount: options.length,
      availability: purchasable.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${env.appUrl}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-charcoal-muted">
          <Link href="/" className="hover:text-rose-deep">Home</Link> <span aria-hidden="true">/</span>{" "}
          <Link href="/shop" className="hover:text-rose-deep">Shop</Link>
          {category && (
            <>
              {" "}<span aria-hidden="true">/</span> <Link href={`/category/${category.slug}`} className="hover:text-rose-deep">{category.name}</Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <ProductGallery images={images} demo={product.isDemo} />

          <div>
            <p className="eyebrow">{PRODUCT_TYPE_LABELS[product.type]}</p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{product.title}</h1>
            <p className="mt-3 text-2xl">
              {prices.length > 1 ? `${formatAudShort(Math.min(...prices))} – ${formatAudShort(Math.max(...prices))}` : formatAudShort(prices[0] ?? 0)}{" "}
              <span className="text-sm text-charcoal-muted">AUD</span>
            </p>
            {product.isDemo && (
              <p className="mt-3 inline-flex rounded-full bg-charcoal/80 px-3 py-1 text-xs uppercase tracking-wider text-white">Sample design · demonstration only</p>
            )}
            <p className="mt-5 text-[17px] leading-relaxed text-charcoal-soft">{product.shortDescription}</p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-[14px]">
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <dt className="text-charcoal-muted">Format</dt>
                <dd className="mt-0.5 font-medium">{FORMAT_LABELS[product.format]}</dd>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <dt className="text-charcoal-muted">Size</dt>
                <dd className="mt-0.5 font-medium">{product.sizeInfo || "See description"}</dd>
              </div>
            </dl>

            <div className="mt-7">
              <PurchaseOptions productId={product.id} slug={product.slug} options={options} isVirtual={isVirtual} unavailableReason={unavailableReason} />
            </div>

            <ul className="mt-6 space-y-2 text-[14px] text-charcoal-soft">
              <li className="flex items-center gap-2"><DownloadIcon size={18} className="text-rose-deep" /> Instant digital download — nothing is posted</li>
              <li className="flex items-center gap-2">
                {isVirtual ? <PhoneIcon size={18} className="text-rose-deep" /> : <PrinterIcon size={18} className="text-rose-deep" />}
                {isVirtual ? "Share by text, email or social media" : "Print at home or at your local print shop"}
              </li>
              <li className="flex items-center gap-2"><LockIcon size={18} className="text-rose-deep" /> Secure checkout · prices in AUD</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Section title="Description" open>
            {product.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
          </Section>
          {product.whatsIncluded && (
            <Section title="What's Included">
              <ul className="!list-none !pl-0">
                {product.whatsIncluded.split("\n").filter(Boolean).map((l) => (
                  <li key={l} className="flex gap-2"><CheckIcon size={18} className="mt-1 shrink-0 text-sage-deep" /> {l}</li>
                ))}
              </ul>
            </Section>
          )}
          <Section title="How It Works">
            <ol>
              <li>Choose {options.length > 1 ? "the ready-made or personalised option" : "this design"}{isCard && options.some((o) => o.kind === "PERSONALISED") ? " — if personalising, type your message and check the live preview" : ""}.</li>
              <li>Check out securely. You don&apos;t need an account.</li>
              <li>Download your files straight away from the confirmation page — we&apos;ll also email you a secure link.</li>
              <li>{isVirtual ? "Share your card by text, WhatsApp, email or social media." : "Print at home, fold and give to someone special."}</li>
            </ol>
          </Section>
          {isVirtual ? (
            <Section title="Sharing Your Virtual Card">
              <p>You&apos;ll receive PNG images sized for phones plus a digital PDF. Save them to your device, then attach them to a message, email or post. Cardly doesn&apos;t send cards on your behalf.</p>
            </Section>
          ) : (
            <Section title="Printing Instructions">
              {product.type === "GREETING_CARD" ? (
                <>
                  <p>Your card is a two-page A4 PDF that folds to A5.</p>
                  <ul>
                    <li>Use A4 card stock — around 200–300 gsm works well (check your printer&apos;s maximum).</li>
                    <li>Print at <strong>Actual size / 100%</strong> (not “fit to page”).</li>
                    <li>Print <strong>double-sided, flipping on the short edge</strong>. No duplex? Print page 1, put the sheet back in the tray and print page 2 — do a plain-paper test first.</li>
                    <li>Fold in half with the front cover facing out.</li>
                  </ul>
                </>
              ) : (
                <p>Print at Actual size / 100% on A4 paper or card. Heavier paper (160–250 gsm) gives a premium finish.</p>
              )}
              <p><Link href="/printing-instructions">Full printing instructions</Link></p>
            </Section>
          )}
          <Section title="Terms of Use">
            <p>For personal, non-commercial use. You may print as many copies as you need for your own use, but please don&apos;t resell, share or redistribute the files. See the <Link href="/licence">Personal Use Licence</Link>.</p>
          </Section>
        </div>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-8 text-center text-4xl">You May Also Love</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  );
}
