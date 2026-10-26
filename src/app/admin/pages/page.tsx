import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getContentPage, PAGE_SLUGS } from "@/lib/content";
import { AdminHeader, Badge, Notice } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pages" };

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [pages, edited] = await Promise.all([
    Promise.all(PAGE_SLUGS.map(async (slug) => ({ slug, ...(await getContentPage(slug)) }))),
    prisma.setting.findMany({ where: { key: { in: PAGE_SLUGS.map((s) => `page:${s}`) } }, select: { key: true } }),
  ]);
  const editedSlugs = new Set(edited.map((e) => e.key.slice(5)));
  return (
    <>
      <AdminHeader title="Pages" intro="Information and policy pages. Pages marked Draft still show in the shop, with a reminder for admins to review them. Please have your policies checked to make sure they suit your business." />
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[560px] text-left text-[15px]">
          <thead className="text-xs uppercase tracking-wider text-charcoal-muted">
            <tr><th className="p-3">Page</th><th className="p-3">Status</th><th className="p-3">Public link</th></tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug} className="border-t border-charcoal/5 hover:bg-cream/60">
                <td className="p-3"><Link href={`/admin/pages/${p.slug}`} className="font-medium hover:text-rose-deep">{p.title}</Link></td>
                <td className="space-x-1 p-3">
                  <Badge tone={p.draft ? "warn" : "good"}>{p.draft ? "Draft" : "Final"}</Badge>
                  {editedSlugs.has(p.slug) ? <Badge>edited</Badge> : <Badge>built-in</Badge>}
                </td>
                <td className="p-3 text-sm"><Link href={`/${p.slug}`} className="link" target="_blank">/{p.slug}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
