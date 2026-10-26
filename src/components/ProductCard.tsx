import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { formatAudShort } from "@/lib/money";
import { PRODUCT_TYPE_LABELS } from "@/lib/labels";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const href = `/products/${product.slug}`;
  const prices =
    product.readyMadeCents !== null && product.personalisedCents !== null
      ? `${formatAudShort(product.readyMadeCents)} – ${formatAudShort(product.personalisedCents)}`
      : formatAudShort(product.fromCents);
  return (
    <article className="group relative flex flex-col">
      <Link href={href} className="block overflow-hidden rounded-2xl bg-peach-light shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.image ? (
            <img
              src={product.image.src}
              srcSet={`${product.image.src} 600w, ${product.image.srcLg} 1400w`}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
              alt=""
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-script text-4xl text-rose">Cardly</div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.isNew && <span className="chip bg-white/90 text-charcoal">New</span>}
            {product.personalisable && <span className="chip bg-rose-deep text-white">Personalise me</span>}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal-muted">
          {PRODUCT_TYPE_LABELS[product.type]}
          {product.isDemo && <span className="ml-1.5 rounded bg-charcoal/10 px-1.5 py-0.5 normal-case tracking-normal">Sample</span>}
        </p>
        <h3 className="mt-1 font-serif text-[1.35rem] leading-tight">
          <Link href={href} className="after:absolute after:inset-0 hover:text-rose-deep focus-visible:outline-none">{product.title}</Link>
        </h3>
        <p className="mt-1 text-[15px] text-charcoal-soft">
          {prices} <span className="text-xs text-charcoal-muted">AUD</span>
        </p>
        <p className="mt-1 text-[13px] text-charcoal-muted">
          {product.personalisable ? "Ready-made or personalised" : "Ready-made design"}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.14em] text-rose-deep">View product →</span>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="relative">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
