import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { imageSrc } from "@/lib/catalog";
import { getHomepageSettings } from "@/lib/settings";
import { AdminHeader, Checkbox, Field, Notice, Panel } from "../ui";
import { saveHomepage } from "../actions/homepage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage" };

function TextArea({ label, name, defaultValue, hint, rows = 3 }: { label: string; name: string; defaultValue: string; hint?: string; rows?: number }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <textarea id={name} name={name} rows={rows} className="input" defaultValue={defaultValue} />
      {hint && <p className="mt-1 text-xs text-charcoal-muted">{hint}</p>}
    </div>
  );
}

function ImageInput({ label, name, removeName, imageKey }: { label: string; name: string; removeName: string; imageKey: string | null }) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-dashed border-charcoal/20 p-4">
      {imageKey ? <img src={imageSrc(imageKey, "sm")} alt={`Current ${label.toLowerCase()}`} className="h-28 w-40 rounded-lg bg-cream object-contain" /> : <span className="flex h-28 w-40 items-center justify-center rounded-lg bg-cream text-xs text-charcoal-muted">No image</span>}
      <div className="space-y-2">
        <div>
          <label htmlFor={name} className="label text-xs">{imageKey ? `Replace ${label.toLowerCase()}` : label} (JPG, PNG or WebP)</label>
          <input id={name} name={name} type="file" accept="image/*" className="text-sm" />
        </div>
        {imageKey && <Checkbox name={removeName} label="Remove this image" />}
      </div>
    </div>
  );
}

export default async function HomepageAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [home, categories] = await Promise.all([
    getHomepageSettings(),
    prisma.category.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }], select: { slug: true, name: true, isHidden: true } }),
  ]);
  return (
    <>
      <AdminHeader title="Homepage" intro="Edit the words and images on your homepage." actions={<Link href="/" className="btn-secondary btn-sm" target="_blank">View homepage</Link>} />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}
      <Notice tone="peach">
        Featured products are chosen on each product&apos;s page (tick <strong>Featured on the homepage</strong>). The category tiles are chosen on the{" "}
        <Link href="/admin/categories" className="link">Categories</Link> page (tick <strong>Show on homepage</strong>).
      </Notice>

      <form action={saveHomepage} className="space-y-6">
        <Panel title="Announcement bar">
          <Field label="Announcement text" name="announcement" maxLength={200} defaultValue={home.announcement} hint="The thin bar at the very top of every page. Leave blank to hide it." />
        </Panel>

        <Panel title="Hero">
          <div className="grid gap-4">
            <Field label="Heading" name="heroHeading" required maxLength={120} defaultValue={home.heroHeading} />
            <TextArea label="Text" name="heroText" defaultValue={home.heroText} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label" name="heroButtonLabel" maxLength={40} defaultValue={home.heroButtonLabel} />
              <Field label="Button link" name="heroButtonHref" defaultValue={home.heroButtonHref} hint="A page on this site, e.g. /shop, or a full https:// address." />
            </div>
            <ImageInput label="Hero image" name="heroImage" removeName="removeHeroImage" imageKey={home.heroImageKey} />
          </div>
        </Panel>

        <Panel title="Featured products">
          <Field label="Section heading" name="featuredHeading" maxLength={120} defaultValue={home.featuredHeading} />
        </Panel>

        <Panel title="More Than Just Cards">
          <div className="grid gap-4">
            <Field label="Section heading" name="moreHeading" maxLength={120} defaultValue={home.moreHeading} />
            <TextArea label="Section text" name="moreText" defaultValue={home.moreText} />
          </div>
        </Panel>

        <Panel title="Seasonal collection (optional)">
          <div className="grid gap-4">
            <div>
              <label htmlFor="seasonalCategorySlug" className="label">Category</label>
              <select id="seasonalCategorySlug" name="seasonalCategorySlug" defaultValue={home.seasonalCategorySlug} className="input py-2.5 sm:w-80">
                <option value="">None (hide this section)</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}{c.isHidden ? " (hidden — won't show)" : ""}</option>)}
              </select>
              <p className="mt-1 text-xs text-charcoal-muted">Up to four published products from this category are shown in their own homepage section, e.g. for Mother&apos;s Day or Christmas.</p>
            </div>
            <Field label="Heading" name="seasonalHeading" maxLength={120} defaultValue={home.seasonalHeading} hint="Leave blank to use the category name." />
            <TextArea label="Text" name="seasonalText" defaultValue={home.seasonalText} hint="Leave blank to use the category description." />
          </div>
        </Panel>

        <Panel title="Promo banner">
          <div className="grid gap-4">
            <Field label="Heading" name="promoHeading" maxLength={120} defaultValue={home.promoHeading} />
            <TextArea label="Text" name="promoText" defaultValue={home.promoText} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label" name="promoButtonLabel" maxLength={40} defaultValue={home.promoButtonLabel} />
              <Field label="Button link" name="promoButtonHref" defaultValue={home.promoButtonHref} hint="A page on this site, e.g. /shop, or a full https:// address." />
            </div>
            <ImageInput label="Promo image" name="promoImage" removeName="removePromoImage" imageKey={home.promoImageKey} />
          </div>
        </Panel>

        <button type="submit" className="btn-primary">Save homepage</button>
      </form>
    </>
  );
}
