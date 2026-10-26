import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { imageSrc } from "@/lib/catalog";
import { AdminHeader, Badge, Notice, Panel } from "../ui";
import { moveCategory } from "../actions/categories";
import { CategoryForm, GROUP_LABEL } from "./CategoryForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; deleted?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <>
      <AdminHeader
        title="Categories"
        intro="Products can belong to several categories. Tick “Show on homepage” to feature a category as a homepage tile: greeting and virtual card categories appear in “Shop by Occasion”, other downloads in “More Than Just Cards”."
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.deleted && <Notice>Category deleted. Its products are still in the shop.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <div className="space-y-8">
        {(Object.keys(GROUP_LABEL) as (keyof typeof GROUP_LABEL)[]).map((g) => {
          const rows = categories.filter((c) => c.group === g);
          return (
            <Panel key={g} title={GROUP_LABEL[g]}>
              {rows.length === 0 ? <p className="text-sm text-charcoal-muted">No categories in this group yet.</p> : (
                <ul className="divide-y divide-charcoal/5">
                  {rows.map((c, i) => (
                    <li key={c.id} id={`cat-${c.id}`} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-peach">{c.imageKey && <img src={imageSrc(c.imageKey, "sm")} alt="" className="h-full w-full object-cover" />}</span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/categories/${c.id}`} className="font-medium hover:text-rose-deep">{c.name}</Link>
                        <p className="truncate text-sm text-charcoal-muted">/{c.slug} · {c._count.products} {c._count.products === 1 ? "product" : "products"}</p>
                        <p className="mt-1 space-x-1">
                          {c.isHidden && <Badge tone="warn">hidden</Badge>}
                          {c.showOnHome && <Badge tone="good">homepage</Badge>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button disabled={i === 0} aria-label={`Move ${c.name} up`} className="btn-secondary btn-sm px-3">↑</button>
                        </form>
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button disabled={i === rows.length - 1} aria-label={`Move ${c.name} down`} className="btn-secondary btn-sm px-3">↓</button>
                        </form>
                        <Link href={`/admin/categories/${c.id}`} className="btn-secondary btn-sm">Edit</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}

        <Panel title="Add a category">
          <CategoryForm />
        </Panel>
      </div>
    </>
  );
}
