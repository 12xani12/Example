import type { Category, DiscountCode } from "@prisma/client";
import { saveDiscount } from "../actions/discounts";
import { Checkbox, Field, Panel } from "../ui";

type Props = { discount?: DiscountCode & { categories: { id: string }[] }; categories: Category[] };

const GROUP_LABEL = { GREETING_CARDS: "Greeting cards", VIRTUAL_CARDS: "Virtual cards", OTHER_DOWNLOADS: "Other downloads" } as const;

/** Formats a date for <input type="datetime-local"> in the server's local time. */
function toLocalInput(d: Date | null | undefined) {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function DiscountForm({ discount, categories }: Props) {
  const selected = new Set(discount?.categories.map((c) => c.id));
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const value = discount ? (discount.type === "PERCENT" ? String(discount.value) : (discount.value / 100).toFixed(2)) : "";
  return (
    <form action={saveDiscount} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {discount && <input type="hidden" name="id" value={discount.id} />}
      <div className="space-y-6">
        <Panel title="Discount">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code" name="code" required maxLength={40} defaultValue={discount?.code} autoComplete="off" className="input py-2.5 uppercase" hint="Letters, numbers, - and _ only. Customers can type it in any case." />
              <Field label="Description (optional)" name="description" maxLength={300} defaultValue={discount?.description} hint="For your reference, e.g. “Spring newsletter offer”." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="label">Type</label>
                <select id="type" name="type" defaultValue={discount?.type ?? "PERCENT"} className="input py-2.5">
                  <option value="PERCENT">Percentage off</option>
                  <option value="FIXED">Fixed amount off (AUD)</option>
                </select>
              </div>
              <Field label="Value" name="value" required inputMode="decimal" defaultValue={value} hint="Percentage: a whole number from 1 to 100. Fixed amount: dollars, e.g. 5 or 2.50." />
            </div>
            <Field label="Minimum subtotal ($, optional)" name="minSubtotal" inputMode="decimal" defaultValue={discount?.minSubtotalCents ? (discount.minSubtotalCents / 100).toFixed(2) : ""} hint="Leave blank for no minimum." />
          </div>
        </Panel>

        <Panel title="Dates & limits">
          <div className="grid gap-4">
            <p className="text-sm text-charcoal-soft">Dates and times are in the server&apos;s time zone ({tz}). Leave blank for no start or expiry.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Starts (${tz})`} name="startsAt" type="datetime-local" defaultValue={toLocalInput(discount?.startsAt)} />
              <Field label={`Expires (${tz})`} name="expiresAt" type="datetime-local" defaultValue={toLocalInput(discount?.expiresAt)} />
            </div>
            <Field label="Maximum uses (optional)" name="maxUses" type="number" min={1} step={1} defaultValue={discount?.maxUses ?? ""} hint={`Leave blank for unlimited.${discount ? ` Used ${discount.usedCount} times so far.` : ""}`} />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Status">
          <Checkbox name="active" label="Active" defaultChecked={discount ? discount.active : true} hint="Untick to switch the code off without deleting it." />
        </Panel>
        <Panel title="Applies to">
          <p className="mb-3 text-sm text-charcoal-soft">Leave everything unticked to apply to all products. Otherwise the discount only applies to products in the ticked categories.</p>
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
        <button type="submit" className="btn-primary w-full">{discount ? "Save discount" : "Create discount"}</button>
      </div>
    </form>
  );
}
