import type { Category } from "@prisma/client";
import { saveCategory } from "../actions/categories";
import { imageSrc } from "@/lib/catalog";
import { Checkbox, Field } from "../ui";

export const GROUP_LABEL = { GREETING_CARDS: "Greeting cards", VIRTUAL_CARDS: "Virtual cards", OTHER_DOWNLOADS: "Other downloads" } as const;

export function CategoryForm({ category }: { category?: Category }) {
  return (
    <form action={saveCategory} className="grid gap-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required maxLength={80} defaultValue={category?.name} />
        <Field label="URL slug" name="slug" defaultValue={category?.slug} hint="Leave blank to generate from the name. Must be unique." />
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" rows={3} maxLength={1000} className="input" defaultValue={category?.description ?? ""} />
        <p className="mt-1 text-xs text-charcoal-muted">Shown at the top of the category page.</p>
      </div>
      <div>
        <label htmlFor="group" className="label">Group</label>
        <select id="group" name="group" defaultValue={category?.group ?? "GREETING_CARDS"} className="input py-2.5 sm:w-72">
          {(Object.keys(GROUP_LABEL) as (keyof typeof GROUP_LABEL)[]).map((g) => <option key={g} value={g}>{GROUP_LABEL[g]}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        <Checkbox name="showOnHome" label="Show on homepage" defaultChecked={category?.showOnHome} hint="Greeting and virtual card categories appear in “Shop by Occasion”; other downloads in “More Than Just Cards”." />
        <Checkbox name="isHidden" label="Hidden" defaultChecked={category?.isHidden} hint="Hidden categories don't appear in the shop menus or homepage." />
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-dashed border-charcoal/20 p-4">
        {category?.imageKey && <img src={imageSrc(category.imageKey, "sm")} alt="Current tile image" className="h-20 w-20 rounded-lg bg-peach object-cover" />}
        <div>
          <label htmlFor="image" className="label text-xs">{category?.imageKey ? "Replace tile image" : "Tile image"} (JPG, PNG or WebP)</label>
          <input id="image" name="image" type="file" accept="image/*" className="text-sm" />
          <p className="mt-1 text-xs text-charcoal-muted">A 5:4 landscape image works best.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-dashed border-charcoal/20 p-4">
        {category?.bannerKey && <img src={imageSrc(category.bannerKey, "sm")} alt="Current banner" className="h-20 w-64 rounded-lg bg-peach object-cover" />}
        <div>
          <label htmlFor="banner" className="label text-xs">{category?.bannerKey ? "Replace page banner" : "Page banner"} (JPG, PNG or WebP)</label>
          <input id="banner" name="banner" type="file" accept="image/*" className="text-sm" />
          <p className="mt-1 text-xs text-charcoal-muted">Shown behind the title on the category page. Wide images (about 1600 × 400 px) with a calm centre work best.</p>
        </div>
      </div>
      <div><button type="submit" className="btn-primary btn-sm">{category ? "Save category" : "Create category"}</button></div>
    </form>
  );
}
