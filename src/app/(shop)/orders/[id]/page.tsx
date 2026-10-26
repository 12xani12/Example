import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { checkOrderAccess, signedDownloadUrl } from "@/lib/order-access";
import { fulfilOrder } from "@/lib/fulfilment";
import { formatAud, formatAudShort } from "@/lib/money";
import { summarise, type Personalisation } from "@/lib/card/personalisation";
import { PRODUCT_TYPE_LABELS } from "@/lib/labels";
import { DownloadIcon, PrinterIcon, PhoneIcon } from "@/components/Icons";
import { LookupForm } from "../lookup/LookupForm";
import { AutoRefresh } from "./AutoRefresh";
import { getCurrentUser } from "@/lib/auth";
import { claimOrder } from "@/app/actions/account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string; new?: string }> }) {
  const { id } = await params;
  const { token, new: isNew } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { entitlements: { orderBy: { createdAt: "asc" } } } } },
  });
  if (!order) notFound();

  const access = await checkOrderAccess(order, token);
  if (!access.ok) {
    return (
      <div className="container-page max-w-xl py-16 text-center">
        <h1 className="text-4xl">{access.reason === "expired" ? "This link has expired" : "Let's find your order"}</h1>
        <p className="mt-3 text-charcoal-soft">
          {access.reason === "expired"
            ? "For your security, download links expire after a while. Enter the email you used at checkout and we'll send you a fresh link straight away."
            : "To keep your purchases private, please open this order from the link in your email, sign in, or request a fresh link below."}
        </p>
        <div className="mt-8 text-left"><LookupForm /></div>
      </div>
    );
  }

  // Self-heal: if payment is confirmed but files weren't generated (e.g. a crash), try again now.
  if ((order.status === "PAID" || order.status === "PARTIALLY_REFUNDED") && order.fulfilmentStatus === "PENDING") {
    await fulfilOrder(order.id);
  }
  const fresh = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { entitlements: { where: { revokedAt: null }, orderBy: { createdAt: "asc" } } } } },
  });

  const user = await getCurrentUser();
  const canClaim = !!user && !fresh.userId && (access.via === "token" || access.via === "browser");
  const paid = fresh.status === "PAID" || fresh.status === "PARTIALLY_REFUNDED";
  const ready = paid && fresh.fulfilmentStatus === "FULFILLED";
  const waiting = fresh.status === "PENDING" || (paid && (fresh.fulfilmentStatus === "PENDING" || fresh.fulfilmentStatus === "PROCESSING"));
  const hasPrintable = fresh.items.some((i) => i.format === "PRINTABLE");
  const hasVirtual = fresh.items.some((i) => i.format === "VIRTUAL");

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      {waiting && <AutoRefresh seconds={4} />}
      {isNew && paid && <p className="font-script text-5xl text-rose">Thank you!</p>}
      <h1 className="mt-1 text-4xl sm:text-5xl">Order {fresh.number}</h1>
      <p className="mt-2 text-charcoal-soft">
        Placed {fresh.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {fresh.email}
      </p>

      {canClaim && (
        <form action={claimOrder} className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-soft">
          <input type="hidden" name="orderId" value={fresh.id} />
          <input type="hidden" name="token" value={token ?? ""} />
          <span className="text-sm text-charcoal-soft">Signed in as {user!.email}. Keep this order in your download library?</span>
          <button type="submit" className="btn-soft btn-sm">Save to my account</button>
        </form>
      )}
      <div className="mt-6" aria-live="polite">
        {fresh.status === "PENDING" && <Status tone="peach" title="Waiting for payment confirmation" text="This usually takes a few seconds. This page will update automatically." />}
        {fresh.status === "FAILED" && <Status tone="blush" title="Payment unsuccessful" text="Your payment didn't go through and you haven't been charged. You can return to your cart and try again." />}
        {fresh.status === "CANCELLED" && <Status tone="blush" title="Checkout cancelled" text="This checkout was cancelled and no payment was taken." />}
        {fresh.status === "REFUNDED" && <Status tone="blush" title="Order refunded" text="This order has been refunded, so its downloads are no longer available. Please contact us if you have any questions." />}
        {paid && fresh.fulfilmentStatus !== "FULFILLED" && fresh.fulfilmentStatus !== "FAILED" && <Status tone="peach" title="Payment received — preparing your files" text="We're creating your files now. This page will update automatically." />}
        {paid && fresh.fulfilmentStatus === "FAILED" && (
          <Status tone="blush" title="We're still preparing your files" text="Something went wrong while creating your files. We've been notified and will email your downloads as soon as they're ready — you don't need to do anything. If you have questions, please contact us with your order number." />
        )}
        {ready && <Status tone="sage" title="Your downloads are ready" text="Download your files below. We've also emailed you a secure link so you can come back any time." />}
      </div>

      <ul className="mt-8 space-y-4">
        {fresh.items.map((item) => (
          <li key={item.id} className="rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl">{item.title}</h2>
                <p className="text-sm text-charcoal-muted">
                  {PRODUCT_TYPE_LABELS[item.productType]} · {item.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"}
                </p>
                {item.personalisation && <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm text-charcoal-soft">{summarise(item.personalisation as Personalisation)}</p>}
              </div>
              <p className="font-medium">{formatAudShort(item.unitPriceCents)}</p>
            </div>
            {ready && item.entitlements.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3">
                {item.entitlements.map((e) => {
                  const exhausted = e.maxDownloads !== null && e.downloadCount >= e.maxDownloads;
                  return (
                    <li key={e.id}>
                      {exhausted ? (
                        <span className="btn-secondary btn-sm cursor-not-allowed opacity-60">Download limit reached — please contact us</span>
                      ) : (
                        <a href={signedDownloadUrl(e.id)} className="btn-primary btn-sm" download>
                          <DownloadIcon size={16} /> {e.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {ready && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {hasPrintable && (
            <div className="rounded-3xl bg-sage p-6">
              <PrinterIcon className="text-sage-deep" />
              <h2 className="mt-2 text-2xl">Printing your card</h2>
              <p className="mt-1 text-[15px] text-charcoal-soft">A4 card stock · Actual size (100%) · double-sided, flip on the short edge · fold in half.</p>
              <Link href="/printing-instructions" className="link mt-2 inline-block text-sm">Full printing instructions</Link>
            </div>
          )}
          {hasVirtual && (
            <div className="rounded-3xl bg-blush p-6">
              <PhoneIcon className="text-rose-deep" />
              <h2 className="mt-2 text-2xl">Sharing your virtual card</h2>
              <p className="mt-1 text-[15px] text-charcoal-soft">Save the PNG images to your phone, then attach them to a text, WhatsApp message, email or social post.</p>
            </div>
          )}
        </div>
      )}

      <section aria-labelledby="receipt" className="mt-10 rounded-3xl border border-charcoal/10 bg-white p-6">
        <h2 id="receipt" className="text-2xl">{fresh.gstMode === "NOT_REGISTERED" ? "Receipt" : "Tax invoice"}</h2>
        <p className="mt-1 text-sm text-charcoal-muted">
          {fresh.businessName}{fresh.abn ? ` · ABN ${fresh.abn}` : ""}{fresh.paidAt ? ` · Paid ${fresh.paidAt.toLocaleDateString("en-AU")}` : ""}
        </p>
        <dl className="mt-4 space-y-1.5 text-[15px]">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatAudShort(fresh.subtotalCents)}</dd></div>
          {fresh.discountCents > 0 && <div className="flex justify-between"><dt>Discount{fresh.discountCodeText ? ` (${fresh.discountCodeText})` : ""}</dt><dd>−{formatAudShort(fresh.discountCents)}</dd></div>}
          {fresh.gstMode === "EXCLUSIVE" && <div className="flex justify-between"><dt>GST</dt><dd>{formatAudShort(fresh.gstCents)}</dd></div>}
          <div className="flex justify-between border-t border-charcoal/10 pt-2 font-medium"><dt>Total</dt><dd>{formatAud(fresh.totalCents)}</dd></div>
          {fresh.gstMode === "INCLUSIVE" && <p className="text-right text-xs text-charcoal-muted">Total includes GST of {formatAudShort(fresh.gstCents)}</p>}
          {fresh.gstMode === "NOT_REGISTERED" && <p className="text-right text-xs text-charcoal-muted">No GST has been charged.</p>}
          {fresh.refundedCents > 0 && <div className="flex justify-between text-rose-deeper"><dt>Refunded</dt><dd>−{formatAudShort(fresh.refundedCents)}</dd></div>}
        </dl>
      </section>
    </div>
  );
}

function Status({ tone, title, text }: { tone: "sage" | "peach" | "blush"; title: string; text: string }) {
  const bg = { sage: "bg-sage", peach: "bg-peach", blush: "bg-blush-light" }[tone];
  return (
    <div className={`rounded-3xl px-6 py-5 ${bg}`}>
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-1 text-[15px] text-charcoal-soft">{text}</p>
    </div>
  );
}
