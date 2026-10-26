import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { imageSrc } from "@/lib/catalog";
import { AdminHeader, Notice, Panel } from "../../ui";
import { ProductForm } from "../ProductForm";
import { TemplateEditor } from "../TemplateEditor";
import { deleteDownloadFile, deleteProduct, updateImage, uploadDownloadFiles, uploadImages } from "../../actions/products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product" };

const ROLES = ["FRONT", "INSIDE", "BACK", "LIFESTYLE", "OTHER"] as const;

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true, categories: true, images: { orderBy: { sortOrder: "asc" } }, files: true, template: true } }),
    prisma.category.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] }),
  ]);
  if (!product) notFound();
  const t = product.template;
  const front = product.images.find((i) => i.role === "FRONT");
  const isCard = product.type === "GREETING_CARD" || product.type === "VIRTUAL_CARD";

  return (
    <>
      <AdminHeader
        title={product.title}
        intro={product.isDemo ? "This is a sample product. Replace its artwork/files, then untick “Sample / demonstration product” to make it purchasable." : undefined}
        actions={<Link href={`/products/${product.slug}`} className="btn-secondary btn-sm" target="_blank">View in shop</Link>}
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <ProductForm product={product} categories={categories} />

      <div id="images" className="mt-8">
        <Panel title="Images">
          <p className="mb-4 text-sm text-charcoal-soft">The first <strong>Front</strong> image is used on product cards. Add inside views and lifestyle mockups to help customers see what they&apos;re buying. Images are converted to fast-loading WebP automatically.</p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {product.images.map((img) => (
              <li key={img.id} className="rounded-xl bg-cream p-3">
                <img src={imageSrc(img.key, "sm")} alt={img.alt} className="aspect-square w-full rounded-lg bg-white object-contain" />
                <form action={updateImage} className="mt-2 space-y-2 text-sm">
                  <input type="hidden" name="id" value={img.id} />
                  <label className="sr-only" htmlFor={`alt-${img.id}`}>Alt text</label>
                  <input id={`alt-${img.id}`} name="alt" defaultValue={img.alt} placeholder="Describe the image (alt text)" className="input py-1.5 text-sm" />
                  <div className="flex gap-2">
                    <select name="role" defaultValue={img.role} className="input py-1.5 text-sm" aria-label="Image type">{ROLES.map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}</select>
                    <input name="sortOrder" type="number" defaultValue={img.sortOrder} className="input w-20 py-1.5 text-sm" aria-label="Sort order" />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary btn-sm flex-1">Save</button>
                    <button name="delete" value="1" className="btn-sm rounded-full px-3 text-rose-deeper hover:bg-blush">Delete</button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
          <form action={uploadImages} className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-charcoal/20 p-4">
            <input type="hidden" name="productId" value={product.id} />
            <div><label htmlFor="images-input" className="label text-xs">Upload images (JPG, PNG, WebP)</label><input id="images-input" name="images" type="file" accept="image/*" multiple required className="text-sm" /></div>
            <div><label htmlFor="img-role" className="label text-xs">Type</label><select id="img-role" name="role" className="input py-2 text-sm">{ROLES.map((r) => <option key={r} value={r}>{r.toLowerCase()}</option>)}</select></div>
            <div><label htmlFor="img-alt" className="label text-xs">Alt text</label><input id="img-alt" name="alt" className="input py-2 text-sm" /></div>
            <button className="btn-primary btn-sm">Upload</button>
          </form>
        </Panel>
      </div>

      <div id="files" className="mt-8">
        <Panel title="Downloadable files">
          <p className="mb-4 text-sm text-charcoal-soft">
            Private files customers receive after paying (PDF, PNG, JPG or ZIP). {isCard && "For cards with a template, the ready-made PDF is generated automatically from the artwork, so uploading is optional — an uploaded ready-made file replaces the generated one."}
          </p>
          {product.files.length > 0 ? (
            <ul className="divide-y divide-charcoal/5 text-sm">
              {product.files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                  <span>{f.filename} <span className="text-charcoal-muted">· {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB · {f.variantKind ? (f.variantKind === "READY_MADE" ? "ready-made" : "personalised extra") : "all options"}</span></span>
                  <form action={deleteDownloadFile}><input type="hidden" name="id" value={f.id} /><button className="text-rose-deeper hover:underline">Delete</button></form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal-muted">No files uploaded.</p>
          )}
          <form action={uploadDownloadFiles} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-charcoal/20 p-4">
            <input type="hidden" name="productId" value={product.id} />
            <div><label htmlFor="files-input" className="label text-xs">Files</label><input id="files-input" name="files" type="file" multiple required accept=".pdf,.png,.jpg,.jpeg,.zip" className="text-sm" /></div>
            <div>
              <label htmlFor="variantKind" className="label text-xs">Delivered with</label>
              <select id="variantKind" name="variantKind" className="input py-2 text-sm">
                <option value="READY_MADE">Ready-made purchases</option>
                <option value="">Every purchase option</option>
                <option value="PERSONALISED">Personalised purchases (extra file)</option>
              </select>
            </div>
            <button className="btn-primary btn-sm">Upload</button>
          </form>
        </Panel>
      </div>

      {(isCard || t) && (
        <div id="template" className="mt-8">
          <Panel title="Card template & personalisation">
            <TemplateEditor
              productId={product.id}
              template={{
                personalisable: t?.personalisable ?? false,
                readyMadeMessage: t?.readyMadeMessage ?? "",
                textX: t?.textX ?? 52, textY: t?.textY ?? 120, textWidth: t?.textWidth ?? 315, textHeight: t?.textHeight ?? 360,
                allowedFonts: t?.allowedFonts ?? ["script", "serif", "sans", "handwritten"], defaultFont: t?.defaultFont ?? "serif",
                defaultFontSize: t?.defaultFontSize ?? 18, minFontSize: t?.minFontSize ?? 12, maxFontSize: t?.maxFontSize ?? 30,
                allowedColours: t?.allowedColours ?? ["#302C2B", "#B4596B", "#5E6F55"], defaultColour: t?.defaultColour ?? "#302C2B", defaultAlign: t?.defaultAlign ?? "center",
              }}
              frontSrc={t?.frontPreviewKey ? imageSrc(t.frontPreviewKey, "lg") : front ? imageSrc(front.key, "lg") : null}
              insideSrc={t?.insidePreviewKey ? imageSrc(t.insidePreviewKey, "lg") : null}
              hasArt={{ front: !!t?.frontArtKey, inside: !!t?.insideArtKey, back: !!t?.backArtKey }}
            />
          </Panel>
        </div>
      )}

      <div className="mt-8">
        <Panel title="Delete product">
          <p className="mb-3 text-sm text-charcoal-soft">Prefer <strong>Archived</strong> status to hide a product but keep its history. Deleting is permanent; customers who already bought it keep their downloads.</p>
          <form action={deleteProduct} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={product.id} />
            <label htmlFor="confirm" className="sr-only">Type DELETE to confirm</label>
            <input id="confirm" name="confirm" placeholder="Type DELETE to confirm" className="input w-60 py-2" />
            <button className="btn-sm rounded-full bg-rose-deeper px-4 text-white">Delete permanently</button>
          </form>
        </Panel>
      </div>
    </>
  );
}
