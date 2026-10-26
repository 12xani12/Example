import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { imageSrc } from "@/lib/catalog";
import { formatAudShort } from "@/lib/money";
import { PRODUCT_TYPE_LABELS } from "@/lib/labels";
import { AdminHeader, Badge, Notice } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; demo?: string; deleted?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = {};
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };
  if (sp.status) where.status = sp.status as Prisma.ProductWhereInput["status"];
  if (sp.demo) where.isDemo = true;
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: { variants: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, _count: { select: { orderItems: true } } },
  });
  return (
    <>
      <AdminHeader title="Products" intro="Add, edit, publish or archive products. Changes appear in the shop immediately." actions={<Link href="/admin/products/new" className="btn-primary btn-sm">Add product</Link>} />
      {sp.deleted && <Notice>Product deleted.</Notice>}
      <form className="mb-5 flex flex-wrap gap-2" method="get">
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search by title" className="input w-64 py-2" />
        <label htmlFor="status" className="sr-only">Status</label>
        <select id="status" name="status" defaultValue={sp.status ?? ""} className="input w-44 py-2">
          <option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option>
        </select>
        <button className="btn-secondary btn-sm">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="text-xs uppercase tracking-wider text-charcoal-muted">
            <tr><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">Prices</th><th className="p-3">Status</th><th className="p-3 text-right">Sold</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-charcoal/5 hover:bg-cream/60">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded bg-peach">{p.images[0] && <img src={imageSrc(p.images[0].key, "sm")} alt="" className="h-full w-full object-cover" />}</span>
                    <span className="font-medium hover:text-rose-deep">{p.title}</span>
                  </Link>
                </td>
                <td className="p-3 text-sm">{PRODUCT_TYPE_LABELS[p.type]}</td>
                <td className="p-3 text-sm">{p.variants.filter((v) => v.active).map((v) => `${v.kind === "READY_MADE" ? "Ready" : "Pers."} ${formatAudShort(v.priceCents)}`).join(" · ")}</td>
                <td className="space-x-1 p-3">
                  <Badge tone={p.status === "PUBLISHED" ? "good" : p.status === "DRAFT" ? "warn" : "neutral"}>{p.status.toLowerCase()}</Badge>
                  {p.isDemo && <Badge tone="warn">sample</Badge>}
                  {p.isFeatured && <Badge>featured</Badge>}
                </td>
                <td className="p-3 text-right">{p._count.orderItems}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-charcoal-muted">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
