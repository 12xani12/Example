import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { dashboardData } from "@/lib/analytics";
import { formatAudShort } from "@/lib/money";
import { prisma } from "@/lib/db";
import { AdminHeader, Badge, Panel, ORDER_STATUS_TONE } from "./ui";
import { BarList, ColumnChart } from "./charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function AdminHome() {
  await requireAdmin();
  const [d, demoCount, failedFulfilment, unread] = await Promise.all([
    dashboardData(30),
    prisma.product.count({ where: { isDemo: true, status: "PUBLISHED" } }),
    prisma.order.count({ where: { fulfilmentStatus: "FAILED" } }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);
  const tiles = [
    { label: "Revenue (net of refunds)", value: formatAudShort(d.totals.revenueCents) },
    { label: "Paid orders", value: String(d.totals.orders) },
    { label: "Average order", value: formatAudShort(d.totals.averageCents) },
    { label: "Files downloaded", value: String(d.totals.downloadsTotal) },
  ];
  return (
    <>
      <AdminHeader title="Dashboard" intro="All figures are calculated from real orders in your database." actions={<Link href="/admin/products/new" className="btn-primary btn-sm">Add product</Link>} />
      {(demoCount > 0 || failedFulfilment > 0 || unread > 0) && (
        <ul className="mb-6 space-y-2 text-sm">
          {demoCount > 0 && <li className="rounded-2xl bg-peach px-4 py-3">{demoCount} published products are still <strong>sample designs</strong> and can&apos;t be bought in live mode. <Link href="/admin/products?demo=1" className="link">Review them</Link></li>}
          {failedFulfilment > 0 && <li className="rounded-2xl bg-blush-light px-4 py-3 text-rose-deeper">{failedFulfilment} paid orders had a problem generating files. <Link href="/admin/orders?fulfilment=FAILED" className="link">Fix now</Link></li>}
          {unread > 0 && <li className="rounded-2xl bg-sage px-4 py-3">{unread} contact messages need a reply. <Link href="/admin/messages" className="link">Open inbox</Link></li>}
        </ul>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-charcoal-muted">{t.label}</p>
            <p className="mt-2 font-serif text-4xl">{t.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel><ColumnChart title="Revenue per day, last 30 days (AUD)" points={d.series.map((s) => ({ label: s.label, value: s.revenueCents, display: formatAudShort(s.revenueCents) }))} /></Panel>
        <Panel><ColumnChart title="Paid orders per day, last 30 days" points={d.series.map((s) => ({ label: s.label, value: s.orders, display: `${s.orders} orders` }))} /></Panel>
        <Panel><BarList title="Best-selling products (units sold, all time)" rows={d.bestSellers.map((b) => ({ label: b.title, value: b.units, display: `${b.units} · ${formatAudShort(b.revenueCents)}` }))} /></Panel>
        <Panel><BarList title="Sales by category (revenue; items in several categories count in each)" rows={d.byCategory.map((c) => ({ label: c.name, value: c.revenueCents, display: formatAudShort(c.revenueCents) }))} /></Panel>
        <Panel><ColumnChart title="Download activity per day, last 30 days" emptyText="No downloads yet" points={d.series.map((s) => ({ label: s.label, value: s.downloads, display: `${s.downloads} downloads` }))} /></Panel>
        <Panel title="Recent orders">
          {d.recent.length === 0 ? <p className="text-sm text-charcoal-muted">No orders yet.</p> : (
            <ul className="divide-y divide-charcoal/5 text-sm">
              {d.recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span><Link href={`/admin/orders/${o.id}`} className="link">{o.number}</Link> <span className="text-charcoal-muted">· {o.email}</span></span>
                  <span className="flex items-center gap-2 whitespace-nowrap"><Badge tone={ORDER_STATUS_TONE[o.status]}>{o.status.replace("_", " ").toLowerCase()}</Badge>{formatAudShort(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
