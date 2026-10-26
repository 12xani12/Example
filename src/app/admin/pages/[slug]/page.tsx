import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getContentPage, PAGE_SLUGS } from "@/lib/content";
import type { PageSlug } from "@/content/pages";
import { Markdown } from "@/components/Markdown";
import { AdminHeader, Checkbox, Field, Notice, Panel } from "../../ui";
import { resetPage, savePage } from "../../actions/pages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit page" };

const CHEAT_SHEET: [string, string][] = [
  ["## Heading", "Section heading"],
  ["### Smaller heading", "Sub-heading"],
  ["(blank line)", "Starts a new paragraph"],
  ["- Item", "Bullet list (one per line)"],
  ["1. Step", "Numbered list (one per line)"],
  ["**bold**", "Bold text"],
  ["*italic*", "Italic text"],
  ["[Shop now](/shop)", "Link to a page or https:// address"],
];

export default async function EditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string; reset?: string; error?: string }> }) {
  await requireAdmin();
  const { slug: raw } = await params;
  if (!PAGE_SLUGS.includes(raw as PageSlug)) notFound();
  const slug = raw as PageSlug;
  const sp = await searchParams;
  const [page, edited] = await Promise.all([getContentPage(slug), prisma.setting.findUnique({ where: { key: `page:${slug}` }, select: { updatedAt: true } })]);
  return (
    <>
      <AdminHeader
        title={page.title}
        intro={edited ? `Last edited ${edited.updatedAt.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}.` : "Showing the built-in draft. Saving creates your own version."}
        actions={
          <>
            <Link href="/admin/pages" className="btn-secondary btn-sm">All pages</Link>
            <Link href={`/${slug}`} className="btn-secondary btn-sm" target="_blank">View page</Link>
          </>
        }
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.reset && <Notice>Reset to the built-in draft.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Panel>
          <form action={savePage} className="grid gap-4">
            <input type="hidden" name="slug" value={slug} />
            <Field label="Title" name="title" required maxLength={120} defaultValue={page.title} />
            <Field label="Meta description" name="description" maxLength={300} defaultValue={page.description} hint="Shown in search engine results. Aim for one or two sentences." />
            <div>
              <label htmlFor="body" className="label">Page content</label>
              <textarea id="body" name="body" required rows={28} spellCheck className="input min-h-[480px] font-mono text-sm leading-relaxed" defaultValue={page.body} />
            </div>
            <Checkbox name="draft" label="Draft" defaultChecked={page.draft} hint="Draft pages are still public, but admins see a reminder to review them. Untick once the page is final." />
            <div><button type="submit" className="btn-primary btn-sm">Save page</button></div>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Formatting">
            <dl className="space-y-2 text-sm">
              {CHEAT_SHEET.map(([code, meaning]) => (
                <div key={code}>
                  <dt className="font-mono text-xs">{code}</dt>
                  <dd className="text-charcoal-muted">{meaning}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-charcoal-muted">Other formatting (including HTML) is shown as plain text.</p>
          </Panel>
          {edited && (
            <Panel title="Reset">
              <p className="mb-3 text-sm text-charcoal-soft">Discard your edits and go back to the built-in draft text.</p>
              <form action={resetPage}>
                <input type="hidden" name="slug" value={slug} />
                <button className="btn-sm rounded-full px-3 text-rose-deeper hover:bg-blush">Reset to built-in draft</button>
              </form>
            </Panel>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Panel title="Preview (last saved version)">
          <div className="max-w-3xl">
            <Markdown source={page.body} />
          </div>
        </Panel>
      </div>
    </>
  );
}
