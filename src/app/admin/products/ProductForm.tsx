import type { Category, Product, ProductVariant } from "@prisma/client";
import { saveProduct } from "../actions/products";
import { PRODUCT_TYPE_FILTERS } from "@/lib/labels";
import { Checkbox, Field, Panel } from "../ui";

type Props = { product?: Product & { variants: ProductVariant[]; categories: { categoryId: string }[] }; categories: Category[] };

const GROUP_LABEL = { GREETING_CARDS: "Greeting cards", VIRTUAL_CARDS: "Virtual cards", OTHER_DOWNLOADS: "Other downloads" } as const;

export function ProductForm({ product, categories }: Props) {
  const ready = product?.variants.find((v) => v.kind === "READY_MADE");
  const pers = product?.variants.find((v) => v.kind === "PERSONALISED");
  const selected = new Set(product?.categories.map((c) => c.categoryId));
  const dollars = (c?: number) => (c !== undefined ? (c / 100).toFixed(2) : "");
  return (
    <form action={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-6">
        <Panel title="Details">
          <div className="grid gap-4">
            <Field label="Title" name="title" required defaultValue={product?.title} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="label">Product type</label>
                <select id="type" name="type" defaultValue={product?.type ?? "GREETING_CARD"} className="input py-2.5">
                  {PRODUCT_TYPE_FILTERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="format" className="label">Format</label>
                <select id="format" name="format" defaultValue={product?.format ?? "PRINTABLE"} className="input py-2.5">
                  <option value="PRINTABLE">Printable</option>
                  <option value="VIRTUAL">Virtual (share digitally)</option>
                </select>
                <p className="mt-1 text-xs text-charcoal-muted">Virtual cards are always virtual.</p>
              </div>
            </div>
            <div>
              <label htmlFor="shortDescription" className="label">Short description</label>
              <textarea id="shortDescription" name="shortDescription" rows={2} className="input" defaultValue={product?.shortDescription} />
            </div>
            <div>
              <label htmlFor="description" className="label">Full description</label>
              <textarea id="description" name="description" rows={6} className="input" defaultValue={product?.description} />
              <p className="mt-1 text-xs text-charcoal-muted">Leave a blank line between paragraphs.</p>
            </div>
            <div>
              <label htmlFor="whatsIncluded" className="label">What&apos;s included (one item per line)</label>
              <textarea id="whatsIncluded" name="whatsIncluded" rows={4} className="input" defaultValue={product?.whatsIncluded} />
            </div>
            <Field label="Size & dimensions" name="sizeInfo" defaultValue={product?.sizeInfo} placeholder="A5 folded card (148 × 210 mm), printed on A4 paper" />
            <Field label="Tags (comma separated)" name="tags" defaultValue={product?.tags.join(", ")} hint="Used by search, e.g. birthday, floral, for her" />
          </div>
        </Panel>

        <Panel title="Prices & purchase options (AUD)">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl bg-cream p-4">
              <Checkbox name="readyEnabled" label="Sell ready-made version" defaultChecked={product ? !!ready?.active : true} />
              <Field label="Ready-made price ($)" name="readyPrice" inputMode="decimal" defaultValue={dollars(ready?.priceCents) || "2.50"} />
            </div>
            <div className="space-y-2 rounded-xl bg-cream p-4">
              <Checkbox name="personalisedEnabled" label="Offer personalisation" defaultChecked={!!pers?.active} hint="Configure the card template below after saving." />
              <Field label="Personalised price ($)" name="personalisedPrice" inputMode="decimal" defaultValue={dollars(pers?.priceCents) || "4.00"} />
            </div>
          </div>
        </Panel>

        <Panel title="Search engines (optional)">
          <div className="grid gap-4">
            <Field label="Custom URL slug" name="slug" defaultValue={product?.slug} hint="Leave blank to generate from the title." />
            <Field label="SEO title" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
            <Field label="SEO description" name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Visibility">
          <div className="space-y-3">
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={product?.status ?? "DRAFT"} className="input py-2.5">
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived (hidden)</option>
              </select>
            </div>
            <Checkbox name="isFeatured" label="Featured on the homepage" defaultChecked={product?.isFeatured} />
            <Checkbox name="isNewArrival" label="Mark as new arrival" defaultChecked={product?.isNewArrival} />
            <Checkbox name="isDemo" label="Sample / demonstration product" defaultChecked={product?.isDemo} hint="Sample products can't be bought. Untick once real files are uploaded." />
            <Field label="Sort order" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} hint="Lower numbers appear first." />
          </div>
        </Panel>
        <Panel title="Categories">
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {(Object.keys(GROUP_LABEL) as (keyof typeof GROUP_LABEL)[]).map((g) => (
              <fieldset key={g}>
                <legend className="eyebrow mb-2">{GROUP_LABEL[g]}</legend>
                {categories.filter((c) => c.group === g).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 py-0.5 text-[15px]">
                    <input type="checkbox" name="categories" value={c.id} defaultChecked={selected.has(c.id)} className="h-4 w-4 accent-rose-deep" />
                    {c.name}{c.isHidden && <span className="text-xs text-charcoal-muted">(hidden)</span>}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </Panel>
        <button type="submit" className="btn-primary w-full">{product ? "Save product" : "Create product"}</button>
      </div>
    </form>
  );
}
