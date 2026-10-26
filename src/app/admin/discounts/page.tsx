import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAudShort } from "@/lib/money";
import { AdminHeader, Badge, Notice } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discounts" };

function fmt(d: Date | null) {
  return d ? d.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default async function DiscountsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const discounts = await prisma.discountCode.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }], include: { categories: { select: { name: true } } } });
  const now = new Date();
  return (
    <>
      <AdminHeader title="Discounts" intro="Create codes customers can enter in their cart. Deleting a code doesn't change past orders." actions={<Link href="/admin/discounts/new" className="btn-primary btn-sm">Add discount</Link>} />
      {sp.deleted && <Notice>Discount code deleted.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[860px] text-left text-[15px]">
          <thead className="text-xs uppercase tracking-wider text-charcoal-muted">
            <tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Used</th><th className="p-3">Status</th><th className="p-3">Starts</th><th className="p-3">Expires</th><th className="p-3">Applies to</th></tr>
          </thead>
          <tbody>
            {discounts.map((d) => {
              const expired = !!d.expiresAt && d.expiresAt < now;
              const upcoming = !!d.startsAt && d.startsAt > now;
              const usedUp = d.maxUses !== null && d.usedCount >= d.maxUses;
              return (
                <tr key={d.id} className="border-t border-charcoal/5 hover:bg-cream/60">
                  <td className="p-3">
                    <Link href={`/admin/discounts/${d.id}`} className="font-medium hover:text-rose-deep">{d.code}</Link>
                    {d.description && <span className="block text-xs text-charcoal-muted">{d.description}</span>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-sm">
                    {d.type === "PERCENT" ? `${d.value}% off` : `${formatAudShort(d.value)} off`}
                    {d.minSubtotalCents > 0 && <span className="block text-xs text-charcoal-muted">min. {formatAudShort(d.minSubtotalCents)}</span>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-sm">{d.usedCount} / {d.maxUses ?? "∞"}</td>
                  <td className="space-x-1 p-3">
                    <Badge tone={d.active ? "good" : "neutral"}>{d.active ? "active" : "inactive"}</Badge>
                    {expired && <Badge tone="bad">expired</Badge>}
                    {upcoming && <Badge tone="warn">scheduled</Badge>}
                    {usedUp && <Badge tone="bad">used up</Badge>}
                  </td>
                  <td className="whitespace-nowrap p-3 text-sm">{fmt(d.startsAt)}</td>
                  <td className="whitespace-nowrap p-3 text-sm">{fmt(d.expiresAt)}</td>
                  <td className="p-3 text-sm">{d.categories.length ? d.categories.map((c) => c.name).join(", ") : "All products"}</td>
                </tr>
              );
            })}
            {discounts.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-charcoal-muted">No discount codes yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
