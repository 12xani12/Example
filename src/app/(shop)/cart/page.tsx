import type { Metadata } from "next";
import Link from "next/link";
import { getCartView } from "@/lib/cart";
import { formatAud, formatAudShort } from "@/lib/money";
import { PRODUCT_TYPE_LABELS } from "@/lib/labels";
import { CartItemActions, DiscountForm } from "./CartClient";
import { ArrowRight, LockIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default async function CartPage({ searchParams }: { searchParams: Promise<{ added?: string; cancelled?: string }> }) {
  const cart = await getCartView();
  const sp = await searchParams;
  const { totals } = cart;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-5xl">Your Cart</h1>
      {sp.added && <p role="status" className="mt-4 inline-block rounded-full bg-sage px-4 py-2 text-sm">Added to your cart.</p>}
      {sp.cancelled && <p role="status" className="mt-4 rounded-2xl bg-peach px-4 py-3 text-sm">Payment was cancelled — nothing has been charged. Your cart is saved below.</p>}

      {cart.lines.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
          <p className="font-script text-5xl text-rose">Nothing here yet</p>
          <p className="mx-auto mt-3 max-w-md text-charcoal-soft">Find a design you love — your downloads will be ready the moment you check out.</p>
          <Link href="/shop" className="btn-primary mt-6">Start shopping <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y divide-charcoal/10 rounded-3xl bg-white px-5 shadow-soft sm:px-8">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/products/${line.slug}`} className="w-24 shrink-0 overflow-hidden rounded-xl bg-peach sm:w-28">
                  {line.image && <img src={line.image.src} alt={line.image.alt} className="aspect-[4/5] w-full object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/products/${line.slug}`} className="font-serif text-2xl leading-tight hover:text-rose-deep">{line.title}</Link>
                      <p className="mt-1 text-[13px] text-charcoal-muted">
                        {PRODUCT_TYPE_LABELS[line.type as keyof typeof PRODUCT_TYPE_LABELS]} · {line.format === "VIRTUAL" ? "Virtual (digital)" : "Printable"} ·{" "}
                        <span className="font-medium text-charcoal">{line.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"}</span>
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-right font-medium">
                      {formatAudShort(line.priceCents)}
                      {line.discountCents > 0 && <span className="block text-xs font-normal text-sage-deep">−{formatAudShort(line.discountCents)}</span>}
                    </p>
                  </div>
                  {line.summary && (
                    <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-[14px] leading-snug text-charcoal-soft">
                      <span className="sr-only">Your message: </span>
                      {line.summary}
                    </p>
                  )}
                  {!line.available && <p className="mt-2 text-sm text-rose-deeper">This item is no longer available. Please remove it to continue.</p>}
                  <CartItemActions itemId={line.id} editHref={line.variantKind === "PERSONALISED" ? `/products/${line.slug}/personalise?item=${line.id}` : null} />
                </div>
              </li>
            ))}
          </ul>

          <aside aria-label="Order summary" className="h-fit rounded-3xl bg-white p-6 shadow-soft sm:p-8 lg:sticky lg:top-28">
            <h2 className="text-3xl">Summary</h2>
            <DiscountForm applied={cart.discountCode} error={cart.discountError} />
            <dl className="mt-6 space-y-2 text-[15px]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatAudShort(totals.subtotalCents)}</dd></div>
              {totals.discountCents > 0 && <div className="flex justify-between text-sage-deep"><dt>Discount</dt><dd>−{formatAudShort(totals.discountCents)}</dd></div>}
              {cart.gstMode === "EXCLUSIVE" && <div className="flex justify-between"><dt>GST ({cart.gstRatePercent}%)</dt><dd>{formatAudShort(totals.gstCents)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery</dt><dd>Instant download</dd></div>
              <div className="flex justify-between border-t border-charcoal/10 pt-3 text-lg font-medium"><dt>Total</dt><dd>{formatAud(totals.totalCents)}</dd></div>
              {cart.gstMode === "INCLUSIVE" && <p className="text-right text-xs text-charcoal-muted">Includes {formatAudShort(totals.gstCents)} GST</p>}
            </dl>
            {cart.hasUnavailable ? (
              <p className="mt-6 rounded-2xl bg-peach px-4 py-3 text-sm">Please remove unavailable items before checking out.</p>
            ) : (
              <Link href="/checkout" className="btn-primary mt-6 w-full py-4">
                <LockIcon size={18} /> Secure checkout
              </Link>
            )}
            <p className="mt-4 text-center text-xs leading-relaxed text-charcoal-muted">
              No account needed. Digital products only — nothing is shipped. You&apos;ll be able to download straight after payment.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
