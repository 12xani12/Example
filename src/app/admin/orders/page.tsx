import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAudShort } from "@/lib/money";
import { AdminHeader, Badge, ORDER_STATUS_TONE } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

const PAGE = 50;

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; fulfilment?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const where: Prisma.OrderWhereInput = {};
  if (sp.q) where.OR = [{ email: { contains: sp.q.trim(), mode: "insensitive" } }, { number: { contains: sp.q.trim().toUpperCase() } }];
  if (sp.status) where.status = sp.status as Prisma.OrderWhereInput["status"];
  if (sp.fulfilment) where.fulfilmentStatus = sp.fulfilment as Prisma.OrderWhereInput["fulfilmentStatus"];
  const page = Math.max(1, Number(sp.page) || 1);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { items: { select: { title: true } }, entitlements: { select: { downloadCount: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return (
    <>
      <AdminHeader title="Orders" intro="Every checkout appears here. Orders are only marked paid after Stripe confirms the payment." />
      <form method="get" className="mb-5 flex flex-wrap gap-2">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Order number or email" className="input w-64 py-2" />
        <label htmlFor="status" className="sr-only">Payment status</label>
        <select id="status" name="status" defaultValue={sp.status ?? ""} className="input w-48 py-2">
          <option value="">All payment statuses</option>
          {["PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].map((s) => <option key={s} value={s}>{s.replace("_", " ").toLowerCase()}</option>)}
        </select>
        <label htmlFor="fulfilment" className="sr-only">Download status</label>
        <select id="fulfilment" name="fulfilment" defaultValue={sp.fulfilment ?? ""} className="input w-48 py-2">
          <option value="">All download statuses</option>
          {["FULFILLED", "PENDING", "PROCESSING", "FAILED"].map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
        </select>
        <button className="btn-secondary btn-sm">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="text-xs uppercase tracking-wider text-charcoal-muted">
            <tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Products</th><th className="p-3">Payment</th><th className="p-3">Downloads</th><th className="p-3 text-right">Amount</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-charcoal/5 align-top hover:bg-cream/60">
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="link">{o.number}</Link></td>
                <td className="whitespace-nowrap p-3">{o.createdAt.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="p-3">{o.email}</td>
                <td className="max-w-[240px] p-3">{o.items.map((i) => i.title).join(", ")}</td>
                <td className="p-3"><Badge tone={ORDER_STATUS_TONE[o.status]}>{o.status.replace("_", " ").toLowerCase()}</Badge></td>
                <td className="p-3">
                  <Badge tone={o.fulfilmentStatus === "FULFILLED" ? "good" : o.fulfilmentStatus === "FAILED" ? "bad" : "neutral"}>{o.fulfilmentStatus.toLowerCase()}</Badge>
                  <span className="ml-1 text-xs text-charcoal-muted">{o.entitlements.reduce((s, e) => s + e.downloadCount, 0)} dl</span>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  {formatAudShort(o.totalCents)}
                  {o.refundedCents > 0 && <span className="block text-xs text-rose-deeper">−{formatAudShort(o.refundedCents)} refunded</span>}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-charcoal-muted">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
      {total > PAGE && (
        <p className="mt-4 flex gap-3 text-sm">
          {page > 1 && <Link className="link" href={`?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}>← Newer</Link>}
          <span>Page {page} of {Math.ceil(total / PAGE)}</span>
          {page * PAGE < total && <Link className="link" href={`?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}>Older →</Link>}
        </p>
      )}
    </>
  );
}
