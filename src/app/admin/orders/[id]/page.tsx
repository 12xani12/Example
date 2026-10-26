import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAudShort } from "@/lib/money";
import { summarise, type Personalisation } from "@/lib/card/personalisation";
import { AdminHeader, Badge, Notice, Panel, ORDER_STATUS_TONE } from "../../ui";
import { resendDownloads, retryFulfilment, setEntitlementAccess, syncRefund } from "../../actions/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order" };

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { entitlements: true } }, payments: true, user: { select: { email: true } } },
  });
  if (!order) notFound();
  const paid = order.status === "PAID" || order.status === "PARTIALLY_REFUNDED";
  const emails = await prisma.emailLog.findMany({ where: { to: order.email, createdAt: { gte: order.createdAt } }, orderBy: { createdAt: "desc" }, take: 10 });

  return (
    <>
      <AdminHeader title={`Order ${order.number}`} intro={`${order.email}${order.user ? " · linked to a customer account" : " · guest checkout"}`} actions={<Link href="/admin/orders" className="btn-secondary btn-sm">All orders</Link>} />
      {sp.saved && <Notice>{sp.saved}</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Items & downloads">
            <ul className="space-y-5">
              {order.items.map((item) => (
                <li key={item.id} className="rounded-xl bg-cream p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl">{item.productId ? <Link href={`/admin/products/${item.productId}`} className="hover:text-rose-deep">{item.title}</Link> : item.title}</p>
                      <p className="text-xs text-charcoal-muted">{item.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"} · {item.format.toLowerCase()}</p>
                    </div>
                    <p>{formatAudShort(item.unitPriceCents)}{item.discountCents > 0 && <span className="block text-xs text-sage-deep">−{formatAudShort(item.discountCents)}</span>}</p>
                  </div>
                  {item.personalisation && (
                    <div className="mt-3 rounded-lg bg-white p-3 text-sm">
                      <p className="text-xs uppercase tracking-wider text-charcoal-muted">Personalisation</p>
                      <p className="mt-1">{summarise(item.personalisation as Personalisation)}</p>
                      <p className="mt-1 text-xs text-charcoal-muted">
                        {(() => { const p = item.personalisation as Personalisation; return `Font ${p.font}, ${p.fontSize}pt, ${p.align}, ${p.colour}`; })()}
                      </p>
                    </div>
                  )}
                  {item.entitlements.length > 0 && (
                    <ul className="mt-3 divide-y divide-charcoal/5 rounded-lg bg-white text-sm">
                      {item.entitlements.map((e) => (
                        <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                          <span>{e.filename} <span className="text-charcoal-muted">· {e.downloadCount}{e.maxDownloads ? `/${e.maxDownloads}` : ""} downloads{e.lastAccessAt ? ` · last ${e.lastAccessAt.toLocaleDateString("en-AU")}` : ""}</span> {e.revokedAt && <Badge tone="bad">revoked</Badge>}</span>
                          <form action={setEntitlementAccess} className="flex gap-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="entitlementId" value={e.id} />
                            {e.revokedAt ? <button name="action" value="restore" className="link text-xs">Restore</button> : <button name="action" value="revoke" className="link text-xs">Revoke</button>}
                            {e.maxDownloads && <button name="action" value="reset" className="link text-xs">Reset count</button>}
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Email activity">
            {emails.length === 0 ? <p className="text-sm text-charcoal-muted">No emails recorded.</p> : (
              <ul className="space-y-1 text-sm">
                {emails.map((e) => <li key={e.id}>{e.createdAt.toLocaleString("en-AU")} · {e.subject} · <Badge tone={e.status === "sent" ? "good" : e.status === "logged" ? "neutral" : "bad"}>{e.status}</Badge></li>)}
              </ul>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Status">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Payment</dt><dd><Badge tone={ORDER_STATUS_TONE[order.status]}>{order.status.replace("_", " ").toLowerCase()}</Badge></dd></div>
              <div className="flex justify-between"><dt>Downloads</dt><dd><Badge tone={order.fulfilmentStatus === "FULFILLED" ? "good" : order.fulfilmentStatus === "FAILED" ? "bad" : "neutral"}>{order.fulfilmentStatus.toLowerCase()}</Badge></dd></div>
              {order.fulfilmentError && <p className="rounded-lg bg-blush-light p-2 text-xs text-rose-deeper">{order.fulfilmentError}</p>}
              <div className="flex justify-between"><dt>Placed</dt><dd>{order.createdAt.toLocaleString("en-AU")}</dd></div>
              {order.paidAt && <div className="flex justify-between"><dt>Paid</dt><dd>{order.paidAt.toLocaleString("en-AU")}</dd></div>}
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatAudShort(order.subtotalCents)}</dd></div>
              {order.discountCents > 0 && <div className="flex justify-between"><dt>Discount {order.discountCodeText}</dt><dd>−{formatAudShort(order.discountCents)}</dd></div>}
              <div className="flex justify-between"><dt>GST ({order.gstMode.toLowerCase().replace("_", " ")})</dt><dd>{formatAudShort(order.gstCents)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Total paid</dt><dd>{formatAudShort(order.totalCents)}</dd></div>
              {order.refundedCents > 0 && <div className="flex justify-between text-rose-deeper"><dt>Refunded</dt><dd>−{formatAudShort(order.refundedCents)}</dd></div>}
              {order.payments.map((p) => <p key={p.id} className="break-all text-xs text-charcoal-muted">{p.provider}: {p.providerRef}</p>)}
            </dl>
          </Panel>
          <Panel title="Actions">
            <div className="space-y-3">
              <form action={resendDownloads}><input type="hidden" name="id" value={order.id} /><button className="btn-secondary btn-sm w-full" disabled={!paid}>Email a fresh download link</button></form>
              <form action={retryFulfilment}><input type="hidden" name="id" value={order.id} />
                <button className="btn-secondary btn-sm w-full" disabled={!paid}>{order.fulfilmentStatus === "FULFILLED" ? "Regenerate files" : "Retry file generation"}</button>
                {order.fulfilmentStatus === "FULFILLED" && <input type="hidden" name="regenerate" value="1" />}
              </form>
              <form action={syncRefund}><input type="hidden" name="id" value={order.id} /><button className="btn-secondary btn-sm w-full" disabled={!order.stripePaymentIntentId}>Sync refund status from Stripe</button></form>
              <p className="text-xs text-charcoal-muted">Issue refunds in your Stripe dashboard; Cardly updates automatically via webhook, or use “Sync refund status”. Fully refunded orders lose download access.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
