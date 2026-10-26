import Link from "next/link";
import { searchProducts, getVisibleCategories, SORTS, type ShopQuery } from "@/lib/catalog";
import { PRODUCT_TYPE_FILTERS } from "@/lib/labels";
import { ProductGrid } from "./ProductCard";
import { AutoSubmitForm } from "./AutoSubmitForm";
import { ChevronLeft, ChevronRight } from "./Icons";

type Props = {
  basePath: string;
  query: ShopQuery;
  /** Filters fixed by the page (e.g. category page) and hidden from the UI. */
  fixed?: Partial<ShopQuery>;
  hide?: ("category" | "type" | "option" | "format")[];
  /** Compact layout (category pages): filters tucked into a dropdown instead of a sidebar. */
  compact?: boolean;
  breadcrumb?: React.ReactNode;
};

function buildHref(basePath: string, query: ShopQuery, patch: Partial<ShopQuery>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...query, ...patch })) if (v) params.set(k, String(v));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function Catalog({ basePath, query, fixed = {}, hide = [], compact = false, breadcrumb }: Props) {
  const merged = { ...query, ...fixed };
  const [result, categories] = await Promise.all([searchProducts(merged), getVisibleCategories()]);
  const occasions = categories.filter((c) => c.group !== "OTHER_DOWNLOADS");
  const activeFilters = ["q", "category", "type", "option", "format", "min", "max", "new"].filter((k) => query[k as keyof ShopQuery] && !(k in fixed));

  const filterForm = (idPrefix: string) => (
    <AutoSubmitForm action={basePath} className="space-y-6">
      {query.sort && <input type="hidden" name="sort" value={query.sort} />}
      <div>
        <label htmlFor={`${idPrefix}-q`} className="label">Search</label>
        <input id={`${idPrefix}-q`} name="q" type="search" defaultValue={query.q ?? ""} placeholder="e.g. birthday, floral" className="input py-2.5" />
      </div>
      {!hide.includes("category") && (
        <div>
          <label htmlFor={`${idPrefix}-category`} className="label">Occasion</label>
          <select id={`${idPrefix}-category`} name="category" defaultValue={query.category ?? ""} className="input py-2.5" data-autosubmit>
            <option value="">All occasions</option>
            {occasions.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      {!hide.includes("type") && (
        <div>
          <label htmlFor={`${idPrefix}-type`} className="label">Product type</label>
          <select id={`${idPrefix}-type`} name="type" defaultValue={query.type ?? ""} className="input py-2.5" data-autosubmit>
            <option value="">All products</option>
            {PRODUCT_TYPE_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      )}
      {!hide.includes("option") && (
        <fieldset>
          <legend className="label">Personalisation</legend>
          {[["", "Any"], ["personalised", "Personalised"], ["ready-made", "Ready-made"]].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2.5 py-1 text-[15px]">
              <input type="radio" name="option" value={v} defaultChecked={(query.option ?? "") === v} className="h-4 w-4 accent-rose-deep" data-autosubmit /> {l}
            </label>
          ))}
        </fieldset>
      )}
      {!hide.includes("format") && (
        <fieldset>
          <legend className="label">Format</legend>
          {[["", "Any"], ["printable", "Printable"], ["virtual", "Virtual"]].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2.5 py-1 text-[15px]">
              <input type="radio" name="format" value={v} defaultChecked={(query.format ?? "") === v} className="h-4 w-4 accent-rose-deep" data-autosubmit /> {l}
            </label>
          ))}
        </fieldset>
      )}
      <fieldset>
        <legend className="label">Price (AUD)</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${idPrefix}-min`}>Minimum price</label>
          <input id={`${idPrefix}-min`} name="min" type="number" min={0} step="0.5" inputMode="decimal" placeholder="Min" defaultValue={query.min ?? ""} className="input py-2.5" />
          <span aria-hidden="true">–</span>
          <label className="sr-only" htmlFor={`${idPrefix}-max`}>Maximum price</label>
          <input id={`${idPrefix}-max`} name="max" type="number" min={0} step="0.5" inputMode="decimal" placeholder="Max" defaultValue={query.max ?? ""} className="input py-2.5" />
        </div>
      </fieldset>
      <label className="flex items-center gap-2.5 text-[15px]">
        <input type="checkbox" name="new" value="1" defaultChecked={query.new === "1"} className="h-4 w-4 accent-rose-deep" data-autosubmit /> New arrivals only
      </label>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary btn-sm flex-1">Apply filters</button>
        {activeFilters.length > 0 && <Link href={basePath} className="btn-secondary btn-sm">Clear</Link>}
      </div>
    </AutoSubmitForm>
  );

  return (
    <div className={compact ? "" : "grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12"}>
      {!compact && (
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl bg-white p-6 shadow-soft">{filterForm("d")}</div>
        </aside>
      )}
      <div>
        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
          {breadcrumb && <div className="w-full sm:w-auto">{breadcrumb}</div>}
          <details className={`group rounded-2xl bg-white shadow-soft ${compact ? "w-full sm:order-last sm:w-auto" : "w-full lg:hidden"}`}>
            <summary className="cursor-pointer list-none px-5 py-2.5 text-sm font-medium">
              Filter {activeFilters.length > 0 && <span className="ml-1 text-rose-deep">({activeFilters.length})</span>}
            </summary>
            <div className={`border-t border-charcoal/5 p-5 ${compact ? "sm:absolute sm:right-0 sm:top-full sm:z-20 sm:mt-2 sm:w-80 sm:rounded-2xl sm:border-0 sm:bg-white sm:shadow-lift" : ""}`}>{filterForm("m")}</div>
          </details>
          <p className={`text-[15px] text-charcoal-soft ${compact ? "sm:ml-auto" : ""}`} aria-live="polite">
            {result.total} {result.total === 1 ? "design" : "designs"}
          </p>
          <AutoSubmitForm action={basePath} className="flex items-center gap-2">
            {Object.entries(query).filter(([k, v]) => v && k !== "sort" && k !== "page").map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={String(v)} />
            ))}
            <label htmlFor="sort" className="text-sm text-charcoal-soft">Sort by</label>
            <select id="sort" name="sort" defaultValue={query.sort ?? "featured"} className="input w-auto py-2 pr-8 text-sm" data-autosubmit>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <noscript><button type="submit" className="btn-secondary btn-sm">Sort</button></noscript>
          </AutoSubmitForm>
        </div>

        {result.items.length > 0 ? (
          <ProductGrid products={result.items} priorityCount={4} />
        ) : (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-soft">
            <p className="font-script text-5xl text-rose">Oh dear</p>
            <h2 className="mt-2 text-3xl">No designs match those filters</h2>
            <p className="mx-auto mt-3 max-w-md text-charcoal-soft">Try removing a filter, searching for something broader like “birthday” or “thank you”, or browse every design.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={basePath} className="btn-primary">Clear filters</Link>
              <Link href="/shop" className="btn-secondary">Shop all</Link>
            </div>
          </div>
        )}

        {result.pages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {result.page > 1 && (
              <Link href={buildHref(basePath, query, { page: String(result.page - 1) })} className="btn-secondary btn-sm" rel="prev">
                <ChevronLeft size={16} /> Previous
              </Link>
            )}
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={buildHref(basePath, query, { page: n === 1 ? undefined : String(n) })}
                aria-current={n === result.page ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm ${n === result.page ? "bg-rose-deep text-white" : "bg-white hover:bg-blush"}`}
              >
                {n}
              </Link>
            ))}
            {result.page < result.pages && (
              <Link href={buildHref(basePath, query, { page: String(result.page + 1) })} className="btn-secondary btn-sm" rel="next">
                Next <ChevronRight size={16} />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

export function PageIntro({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-gradient-to-b from-blush/70 to-cream">
      <div className="container-page py-12 text-center sm:py-16">
        {eyebrow && <p className="eyebrow flourish">{eyebrow}</p>}
        <h1 className="mt-3 text-5xl sm:text-6xl">{title}</h1>
        {intro && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-charcoal-soft">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
