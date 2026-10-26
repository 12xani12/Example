import "server-only";
import { prisma } from "./db";

const SOLD = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
const TZ = "Australia/Sydney";

function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

/** All figures come from real orders in the database. */
export async function dashboardData(days = 30) {
  const since = new Date(Date.now() - days * 86400_000);
  const [allSold, recentSold, items, downloadsRecent, downloadsTotal, recent] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: [...SOLD] } }, _sum: { totalCents: true, refundedCents: true, gstCents: true }, _count: { _all: true } }),
    prisma.order.findMany({ where: { status: { in: [...SOLD] }, paidAt: { gte: since } }, select: { paidAt: true, totalCents: true, refundedCents: true } }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: [...SOLD] } } },
      select: { productId: true, title: true, unitPriceCents: true, discountCents: true, product: { select: { categories: { select: { category: { select: { name: true } } } } } } },
    }),
    prisma.downloadEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.downloadEvent.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { items: true } } } }),
  ]);

  const series: { date: string; label: string; orders: number; revenueCents: number; downloads: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    series.push({ date: dayKey(d), label: d.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: TZ }), orders: 0, revenueCents: 0, downloads: 0 });
  }
  const byDate = new Map(series.map((s) => [s.date, s]));
  for (const o of recentSold) {
    const s = o.paidAt && byDate.get(dayKey(o.paidAt));
    if (s) {
      s.orders += 1;
      s.revenueCents += o.totalCents - o.refundedCents;
    }
  }
  for (const d of downloadsRecent) {
    const s = byDate.get(dayKey(d.createdAt));
    if (s) s.downloads += 1;
  }

  const products = new Map<string, { title: string; units: number; revenueCents: number }>();
  const categories = new Map<string, { units: number; revenueCents: number }>();
  for (const it of items) {
    const key = it.productId ?? it.title;
    const net = it.unitPriceCents - it.discountCents;
    const p = products.get(key) ?? { title: it.title, units: 0, revenueCents: 0 };
    p.units += 1;
    p.revenueCents += net;
    products.set(key, p);
    for (const c of it.product?.categories ?? []) {
      const e = categories.get(c.category.name) ?? { units: 0, revenueCents: 0 };
      e.units += 1;
      e.revenueCents += net;
      categories.set(c.category.name, e);
    }
  }

  const gross = allSold._sum.totalCents ?? 0;
  const refunded = allSold._sum.refundedCents ?? 0;
  return {
    totals: {
      orders: allSold._count._all,
      revenueCents: gross - refunded,
      grossCents: gross,
      refundedCents: refunded,
      gstCents: allSold._sum.gstCents ?? 0,
      averageCents: allSold._count._all ? Math.round(gross / allSold._count._all) : 0,
      downloadsTotal,
    },
    series,
    bestSellers: [...products.values()].sort((a, b) => b.units - a.units || b.revenueCents - a.revenueCents).slice(0, 8),
    byCategory: [...categories.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenueCents - a.revenueCents).slice(0, 8),
    recent,
  };
}
