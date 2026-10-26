import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Notice, Panel } from "../../ui";
import { deleteCategory } from "../../actions/categories";
import { CategoryForm } from "../CategoryForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit category" };

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!category) notFound();
  return (
    <>
      <AdminHeader
        title={category.name}
        intro={`${category._count.products} ${category._count.products === 1 ? "product is" : "products are"} in this category. Assign products to categories from each product's page.`}
        actions={
          <>
            <Link href="/admin/categories" className="btn-secondary btn-sm">All categories</Link>
            {!category.isHidden && <Link href={`/category/${category.slug}`} className="btn-secondary btn-sm" target="_blank">View in shop</Link>}
          </>
        }
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <Panel title="Details">
        <CategoryForm category={category} />
      </Panel>

      <div className="mt-8">
        <Panel title="Delete category">
          <p className="mb-3 text-sm text-charcoal-soft">Deleting removes the category only. Its products stay in the shop and in any other categories they belong to. Consider ticking <strong>Hidden</strong> instead.</p>
          <form action={deleteCategory} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={category.id} />
            <label htmlFor="confirm" className="sr-only">Type the category name to confirm</label>
            <input id="confirm" name="confirm" placeholder={`Type “${category.name}” to confirm`} autoComplete="off" className="input w-72 max-w-full py-2" />
            <button className="btn-sm rounded-full bg-rose-deeper px-4 text-white">Delete permanently</button>
          </form>
        </Panel>
      </div>
    </>
  );
}
