import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Notice, Panel } from "../../ui";
import { deleteDiscount } from "../../actions/discounts";
import { DiscountForm } from "../DiscountForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit discount" };

export default async function EditDiscount({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const [discount, categories, orders] = await Promise.all([
    prisma.discountCode.findUnique({ where: { id }, include: { categories: { select: { id: true } } } }),
    prisma.category.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] }),
    prisma.order.count({ where: { discountCodeId: id } }),
  ]);
  if (!discount) notFound();
  return (
    <>
      <AdminHeader
        title={discount.code}
        intro={`Used ${discount.usedCount} ${discount.usedCount === 1 ? "time" : "times"}${discount.maxUses ? ` of ${discount.maxUses}` : ""} · linked to ${orders} ${orders === 1 ? "order" : "orders"}.`}
        actions={<Link href="/admin/discounts" className="btn-secondary btn-sm">All discounts</Link>}
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <DiscountForm discount={discount} categories={categories} />

      <div className="mt-8">
        <Panel title="Delete discount">
          <p className="mb-3 text-sm text-charcoal-soft">To stop a code being used, untick <strong>Active</strong> instead. Deleting is permanent; past orders keep a record of the code they used.</p>
          <form action={deleteDiscount} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={discount.id} />
            <label htmlFor="confirm" className="sr-only">Type the code to confirm</label>
            <input id="confirm" name="confirm" placeholder={`Type ${discount.code} to confirm`} autoComplete="off" className="input w-64 max-w-full py-2" />
            <button className="btn-sm rounded-full bg-rose-deeper px-4 text-white">Delete permanently</button>
          </form>
        </Panel>
      </div>
    </>
  );
}
