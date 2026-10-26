import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCartView } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { mockPaymentsEnabled } from "@/lib/env";
import { formatAud, formatAudShort } from "@/lib/money";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ failed?: string }> }) {
  const [cart, user, sp] = await Promise.all([getCartView(), getCurrentUser(), searchParams]);
  if (cart.lines.length === 0) redirect("/cart");
  if (cart.hasUnavailable) redirect("/cart");
  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 text-5xl">Almost there</h1>
      {sp.failed && (
        <p role="alert" className="mt-4 rounded-2xl bg-blush-light px-4 py-3 text-sm text-rose-deeper">
          Your payment didn&apos;t go through and you haven&apos;t been charged. Please try again or use a different payment method.
        </p>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-2xl">Where should we send your downloads?</h2>
          <p className="mt-1 text-[15px] text-charcoal-soft">
            You can check out as a guest. {user ? `Signed in as ${user.email}.` : <>Have an account? <Link href="/account/login?next=/checkout" className="link">Sign in</Link> to save this order to your library.</>}
          </p>
          <CheckoutForm defaultEmail={user?.email ?? ""} simulated={mockPaymentsEnabled()} />
        </div>
        <aside aria-label="Order summary" className="h-fit rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-2xl">Your order</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span>
                  {l.title}
                  <span className="block text-xs text-charcoal-muted">{l.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"} · {l.format === "VIRTUAL" ? "Virtual" : "Printable"}</span>
                </span>
                <span className="whitespace-nowrap">{formatAudShort(l.priceCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-charcoal/10 pt-4 text-[15px]">
            {cart.totals.discountCents > 0 && <div className="flex justify-between text-sage-deep"><dt>Discount ({cart.discountCode})</dt><dd>−{formatAudShort(cart.totals.discountCents)}</dd></div>}
            {cart.gstMode === "EXCLUSIVE" && <div className="flex justify-between"><dt>GST</dt><dd>{formatAudShort(cart.totals.gstCents)}</dd></div>}
            <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{formatAud(cart.totals.totalCents)}</dd></div>
            {cart.gstMode === "INCLUSIVE" && <p className="text-right text-xs text-charcoal-muted">Includes {formatAudShort(cart.totals.gstCents)} GST</p>}
          </dl>
          <Link href="/cart" className="link mt-4 inline-block text-sm">Edit cart</Link>
        </aside>
      </div>
    </div>
  );
}
