"use client";

import { useEffect, useMemo, useState } from "react";
import { saveTemplate } from "../actions/products";
import { BRAND_TEXT_COLOURS, CARD_FONTS, FONT_KEYS, type FontKey } from "@/lib/card/constants";
import { layoutMessage, type MeasurableFont } from "@/lib/card/layout";
import { loadCardFont } from "@/lib/card/client-fonts";
import { CardPanel } from "@/components/editor/CardPreview";
import type { TemplateSettings } from "@/lib/card/personalisation";

type Props = {
  productId: string;
  template: TemplateSettings & { personalisable: boolean; readyMadeMessage: string };
  frontSrc: string | null;
  insideSrc: string | null;
  hasArt: { front: boolean; inside: boolean; back: boolean };
};

const SAMPLE = { recipient: "Sophie", message: "Wishing you the happiest birthday!\n\nHope your day is filled with love, laughter and all your favourite things.", signOff: "Love, Emma xx" };

export function TemplateEditor({ productId, template, frontSrc, insideSrc, hasArt }: Props) {
  const [t, setT] = useState(template);
  const [font, setFont] = useState<MeasurableFont | null>(null);
  useEffect(() => {
    loadCardFont((t.allowedFonts.includes(t.defaultFont) ? t.defaultFont : t.allowedFonts[0] ?? "serif") as FontKey).then(setFont).catch(() => undefined);
  }, [t.defaultFont, t.allowedFonts]);
  const layout = useMemo(() => {
    if (!font) return null;
    const p = { ...SAMPLE, font: t.defaultFont as FontKey, fontSize: t.defaultFontSize, align: t.defaultAlign as "center", colour: t.allowedColours[0] ?? "#302C2B" };
    return layoutMessage(p, t, font);
  }, [font, t]);
  const set = (k: keyof typeof t, v: unknown) => setT((cur) => ({ ...cur, [k]: v }));
  const numField = (k: "textX" | "textY" | "textWidth" | "textHeight" | "minFontSize" | "maxFontSize" | "defaultFontSize", label: string, step = 1) => (
    <div>
      <label htmlFor={k} className="label text-xs">{label}</label>
      <input id={k} name={k} type="number" step={step} value={t[k]} onChange={(e) => set(k, Number(e.target.value))} className="input py-2" />
    </div>
  );

  return (
    <form action={saveTemplate} className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <input type="hidden" name="productId" value={productId} />
      <div>
        <p className="mb-2 text-sm font-medium">Inside right preview (sample message)</p>
        <div className="shadow-card"><CardPanel kind="inside-right" frontSrc={frontSrc} insideSrc={insideSrc} layout={layout} template={t} showGuides title="" /></div>
        {layout?.overflow && <p className="mt-2 text-sm text-rose-deeper">The sample message overflows this text area at the default size.</p>}
        <p className="mt-2 text-xs text-charcoal-muted">Coordinates are in points on an A5 panel (419.5 × 595.3 pt), measured from the top-left corner.</p>
        {frontSrc && (
          <div className="mt-4 w-32 shadow-soft"><CardPanel kind="front" frontSrc={frontSrc} insideSrc={null} layout={null} template={t} title="" /></div>
        )}
      </div>
      <div className="space-y-5">
        <label className="flex items-center gap-2.5 text-[15px]">
          <input type="checkbox" name="personalisable" checked={t.personalisable} onChange={(e) => set("personalisable", e.target.checked)} className="h-4 w-4 accent-rose-deep" />
          Customers can personalise the inside message
        </label>

        <fieldset className="grid gap-3 rounded-xl bg-cream p-4 sm:grid-cols-3">
          <legend className="label">Artwork (PNG or JPG, ideally 1748 × 2480 px — A5 portrait at 300 dpi)</legend>
          {([["frontArt", "Front cover", hasArt.front], ["insideArt", "Inside right background", hasArt.inside], ["backArt", "Back cover (optional)", hasArt.back]] as const).map(([name, label, has]) => (
            <div key={name}>
              <label htmlFor={name} className="label text-xs">{label}{has && <span className="ml-1 text-sage-deep">✓ uploaded</span>}</label>
              <input id={name} name={name} type="file" accept="image/png,image/jpeg" className="block w-full text-sm" />
              {has && <label className="mt-1 flex items-center gap-1.5 text-xs"><input type="checkbox" name={`remove_${name}`} /> Remove</label>}
            </div>
          ))}
          <p className="text-xs text-charcoal-muted sm:col-span-3">Artwork is stored privately at full resolution for generated files. A web-sized copy is used for previews. Without a back cover, a small Cardly logo is printed.</p>
        </fieldset>

        <fieldset>
          <legend className="label">Editable text area</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numField("textX", "Left (pt)")}{numField("textY", "Top (pt)")}{numField("textWidth", "Width (pt)")}{numField("textHeight", "Height (pt)")}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Fonts customers can choose</legend>
          <div className="flex flex-wrap gap-3">
            {FONT_KEYS.map((f) => (
              <label key={f} className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm">
                <input type="checkbox" name="allowedFonts" value={f} checked={t.allowedFonts.includes(f)} onChange={(e) => set("allowedFonts", e.target.checked ? [...t.allowedFonts, f] : t.allowedFonts.filter((x) => x !== f))} className="accent-rose-deep" />
                <span style={{ fontFamily: CARD_FONTS[f].cssFamily }} className="text-lg">{CARD_FONTS[f].label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="defaultFont" className="label text-xs">Default font</label>
            <select id="defaultFont" name="defaultFont" value={t.defaultFont} onChange={(e) => set("defaultFont", e.target.value)} className="input py-2">
              {t.allowedFonts.map((f) => <option key={f} value={f}>{CARD_FONTS[f as FontKey]?.label ?? f}</option>)}
            </select>
          </div>
          {numField("defaultFontSize", "Default size (pt)", 0.5)}{numField("minFontSize", "Min size", 0.5)}{numField("maxFontSize", "Max size", 0.5)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="allowedColours" className="label text-xs">Allowed text colours (hex, comma separated)</label>
            <input id="allowedColours" name="allowedColours" value={t.allowedColours.join(", ")} onChange={(e) => set("allowedColours", e.target.value.split(/[\s,]+/).filter(Boolean).map((c) => c.toUpperCase()))} className="input py-2" />
            <p className="mt-1 flex flex-wrap gap-1 text-xs text-charcoal-muted">Brand colours: {BRAND_TEXT_COLOURS.map((c) => <span key={c.hex}>{c.label} {c.hex}</span>)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="defaultColour" className="label text-xs">Default colour</label>
              <select id="defaultColour" name="defaultColour" value={t.defaultColour} onChange={(e) => set("defaultColour", e.target.value)} className="input py-2">
                {t.allowedColours.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="defaultAlign" className="label text-xs">Default alignment</label>
              <select id="defaultAlign" name="defaultAlign" value={t.defaultAlign} onChange={(e) => set("defaultAlign", e.target.value)} className="input py-2">
                <option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="readyMadeMessage" className="label text-xs">Pre-printed message for the ready-made version (leave blank for a blank inside)</label>
          <textarea id="readyMadeMessage" name="readyMadeMessage" rows={2} value={t.readyMadeMessage} onChange={(e) => set("readyMadeMessage", e.target.value)} className="input" />
        </div>
        <p className="text-xs text-charcoal-muted">Print layout: A4 landscape sheet, folds to A5 (the supported printable card format).</p>
        <button type="submit" className="btn-primary">Save card template</button>
      </div>
    </form>
  );
}
