import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { formatAudShort } from "@/lib/money";
import { PRODUCT_TYPE_LABELS } from "@/lib/labels";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const href = `/products/${product.slug}`;
  const price =
    product.readyMadeCents !== null && product.personalisedCents !== null
      ? `From ${formatAudShort(Math.min(product.readyMadeCents, product.personalisedCents))}`
      : formatAudShort(product.fromCents);
  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-lg bg-kraft shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
        <div className="flex aspect-[4/5] items-center justify-center p-[11%]">
          {product.image ? (
            <img
              src={product.image.src}
              srcSet={`${product.image.src} 600w, ${product.image.srcLg} 1400w`}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
              alt=""
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="max-h-full w-auto shadow-[0_10px_20px_-8px_rgba(58,42,40,0.35)] transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="font-script text-4xl text-rose">Cardly</span>
          )}
        </div>
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.isNew && <span className="chip bg-white/90 text-charcoal">New</span>}
          {product.personalisable && <span className="chip bg-rose-deep text-white">Personalise me</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <h3 className="font-sans text-[15px] font-medium leading-snug">
          <Link href={href} className="after:absolute after:inset-0 hover:text-rose-deep focus-visible:outline-none">{product.title}</Link>
        </h3>
        <p className="mt-0.5 text-[15px]">{price} <span className="text-[11px] text-charcoal-muted">AUD</span></p>
        <p className="mt-1 text-[12px] leading-snug text-charcoal-muted">
          {PRODUCT_TYPE_LABELS[product.type]}
          {product.personalisable ? " · Ready-made or personalised" : " · Ready-made"}
          {product.isDemo && " · Sample"}
        </p>
        <span className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-rose-deep opacity-80 transition group-hover:opacity-100">View details →</span>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="relative">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
