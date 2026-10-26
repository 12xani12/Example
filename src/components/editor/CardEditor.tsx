"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { BRAND_TEXT_COLOURS, CARD_FONTS, LIMITS, type Align, type FontKey } from "@/lib/card/constants";
import { defaultPersonalisation, isBlank, type Personalisation, type TemplateSettings } from "@/lib/card/personalisation";
import { layoutMessage, layoutProblems, type CardLayout, type MeasurableFont } from "@/lib/card/layout";
import { loadCardFont } from "@/lib/card/client-fonts";
import { formatAudShort } from "@/lib/money";
import { CardPanel, type PanelKind } from "./CardPreview";
import { AlignCenter, AlignLeft, AlignRight, BagIcon, CloseIcon, EyeIcon, ResetIcon } from "../Icons";

type Props = {
  productId: string;
  slug: string;
  title: string;
  isVirtual: boolean;
  priceCents: number;
  template: TemplateSettings;
  frontSrc: string | null;
  insideSrc: string | null;
  initial: Personalisation | null;
  editItemId: string | null;
};

const VIEWS: { kind: PanelKind; label: string; virtual?: boolean }[] = [
  { kind: "front", label: "Front Cover" },
  { kind: "inside-left", label: "Inside Left" },
  { kind: "inside-right", label: "Inside Right" },
  { kind: "back", label: "Back Cover" },
];

export function CardEditor(props: Props) {
  const { template, isVirtual } = props;
  const draftKey = `cardly-draft-${props.productId}`;
  const [p, setP] = useState<Personalisation>(() => props.initial ?? defaultPersonalisation(template));
  const [view, setView] = useState<PanelKind>("inside-right");
  const [font, setFont] = useState<MeasurableFont | null>(null);
  const [fontError, setFontError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const loadedDraft = useRef(false);

  // Restore an unsaved draft (new cards only) so navigating away never loses the message.
  useEffect(() => {
    if (props.initial || loadedDraft.current) return;
    loadedDraft.current = true;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setP((cur) => ({ ...cur, ...JSON.parse(saved) }));
    } catch {
      /* ignore unavailable storage */
    }
  }, [draftKey, props.initial]);

  useEffect(() => {
    if (props.initial) return;
    try {
      if (isBlank(p)) localStorage.removeItem(draftKey);
      else localStorage.setItem(draftKey, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, [p, draftKey, props.initial]);

  useEffect(() => {
    let alive = true;
    setFont(null);
    loadCardFont(p.font)
      .then((f) => alive && setFont(f))
      .catch(() => alive && setFontError(true));
    return () => {
      alive = false;
    };
  }, [p.font]);

  // Warm up the other fonts so switching is instant.
  useEffect(() => {
    template.allowedFonts.forEach((k) => loadCardFont(k as FontKey).catch(() => undefined));
  }, [template.allowedFonts]);

  const layout: CardLayout | null = useMemo(() => (font ? layoutMessage(p, template, font) : null), [font, p, template]);
  const problems = layout ? layoutProblems(layout) : [];
  const blank = isBlank(p);
  const update = (patch: Partial<Personalisation>) => {
    setServerError(null);
    setP((cur) => ({ ...cur, ...patch }));
    if (view !== "inside-right") setView("inside-right");
  };

  const views = VIEWS.filter((v) => !isVirtual || v.kind === "front" || v.kind === "inside-right").map((v) =>
    isVirtual && v.kind === "inside-right" ? { ...v, label: "Message Page" } : v,
  );

  const submit = () =>
    start(async () => {
      setServerError(null);
      const res = await addToCart({ productId: props.productId, kind: "PERSONALISED", personalisation: p, editItemId: props.editItemId ?? undefined });
      if (res.ok) {
        try {
          localStorage.removeItem(draftKey);
        } catch {
          /* ignore */
        }
        router.push(res.redirect ?? "/cart");
      } else setServerError(res.error);
    });

  const sizeStep = 0.5;
  const fonts = template.allowedFonts.filter((f): f is FontKey => f in CARD_FONTS);
  const colours = template.allowedColours.map((hex) => ({ hex, label: BRAND_TEXT_COLOURS.find((c) => c.hex.toUpperCase() === hex.toUpperCase())?.label ?? hex }));
  const msgCount = [...p.message].length;

  const panelProps = { frontSrc: props.frontSrc, insideSrc: props.insideSrc, layout, template, title: props.title };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      {/* Preview */}
      <section aria-label="Card preview" className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] bg-gradient-to-br from-blush via-blush-light to-peach p-4 sm:p-8">
          <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Card pages">
            {views.map((v) => (
              <button
                key={v.kind}
                type="button"
                role="tab"
                aria-selected={view === v.kind}
                onClick={() => setView(v.kind)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.12em] transition ${view === v.kind ? "bg-charcoal text-white" : "bg-white/70 hover:bg-white"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="relative mx-auto" style={{ perspective: "1600px" }}>
            {(view === "inside-left" || view === "inside-right") && !isVirtual ? (
              <div key="inside" className="mx-auto flex max-w-[640px] animate-[page-turn_0.55s_cubic-bezier(.2,.7,.2,1)_both] shadow-lift" style={{ transformOrigin: "50% 50%" }}>
                <div className={`hidden w-1/2 sm:block ${view === "inside-left" ? "" : "opacity-95"}`}>
                  <CardPanel kind="inside-left" {...panelProps} className="rounded-l-md" />
                </div>
                <div className="relative w-full sm:w-1/2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-6 bg-gradient-to-r from-charcoal/10 to-transparent sm:block" />
                  {view === "inside-left" ? (
                    <>
                      <div className="sm:hidden"><CardPanel kind="inside-left" {...panelProps} /></div>
                      <div className="hidden sm:block"><CardPanel kind="inside-right" {...panelProps} showGuides className="rounded-r-md" /></div>
                    </>
                  ) : (
                    <CardPanel kind="inside-right" {...panelProps} showGuides className="rounded-md sm:rounded-l-none" />
                  )}
                </div>
              </div>
            ) : (
              <div key={view} className="mx-auto max-w-[340px] animate-[page-turn_0.55s_cubic-bezier(.2,.7,.2,1)_both] shadow-lift sm:max-w-[360px]">
                <CardPanel kind={view} {...panelProps} showGuides={view === "inside-right"} className="rounded-md" />
              </div>
            )}
            {!font && !fontError && (
              <div className="absolute inset-0 flex items-center justify-center" aria-live="polite">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm shadow-soft">Loading fonts…</span>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-[13px] text-charcoal-soft">
            {isVirtual ? "Your message page is shared alongside the card front." : "Live preview of your printed card (A5, folded). The dashed line shows the printable message area."}
          </p>
        </div>
      </section>

      {/* Controls */}
      <section aria-labelledby="editor-heading" className="pb-28 lg:pb-0">
        <p className="eyebrow">Personalise your card</p>
        <h1 id="editor-heading" className="mt-2 text-4xl leading-tight">{props.title}</h1>
        <p className="mt-2 text-[15px] text-charcoal-soft">
          Add your words to the inside. The front artwork stays exactly as designed. All fields are optional — leave them empty for a clean, blank inside.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="recipient" className="label">Recipient&apos;s name</label>
            <input id="recipient" className="input" value={p.recipient} maxLength={LIMITS.recipient} placeholder="e.g. Sophie" autoComplete="off" enterKeyHint="next" onChange={(e) => update({ recipient: e.target.value })} />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="message" className="label">Personal message</label>
              <span className={`text-xs ${msgCount > LIMITS.message * 0.9 ? "text-rose-deeper" : "text-charcoal-muted"}`} aria-live="polite">
                {msgCount}/{LIMITS.message}
              </span>
            </div>
            <textarea
              id="message"
              className="input min-h-[150px] resize-y leading-relaxed"
              value={p.message}
              maxLength={LIMITS.message}
              placeholder={"e.g. Wishing you the happiest birthday!\n\nHope your day is filled with love, laughter and all your favourite things."}
              onChange={(e) => update({ message: e.target.value })}
              aria-describedby="message-help"
            />
            <p id="message-help" className="mt-1 text-xs text-charcoal-muted">Press Enter for a new line. Blank lines create paragraph spacing.</p>
          </div>
          <div>
            <label htmlFor="signoff" className="label">From</label>
            <textarea id="signoff" rows={2} className="input resize-none" value={p.signOff} maxLength={LIMITS.signOff} placeholder="e.g. Love, Emma xx" onChange={(e) => update({ signOff: e.target.value })} />
          </div>

          <fieldset>
            <legend className="label">Font</legend>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map((f) => (
                <label key={f} className={`cursor-pointer rounded-xl border-2 bg-white px-3 py-2.5 text-center transition ${p.font === f ? "border-rose-deep" : "border-charcoal/10 hover:border-rose/60"}`}>
                  <input type="radio" name="font" className="sr-only" checked={p.font === f} onChange={() => update({ font: f })} />
                  <span className="block text-2xl leading-tight" style={{ fontFamily: CARD_FONTS[f].cssFamily }}>Happy Days</span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-charcoal-muted">{CARD_FONTS[f].label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="size" className="label">Text size</label>
              <div className="flex items-center gap-3">
                <button type="button" className="h-10 w-10 shrink-0 rounded-full bg-white text-lg shadow-soft disabled:opacity-40" aria-label="Smaller text" disabled={p.fontSize <= template.minFontSize} onClick={() => update({ fontSize: Math.max(template.minFontSize, p.fontSize - sizeStep) })}>−</button>
                <input id="size" type="range" min={template.minFontSize} max={template.maxFontSize} step={sizeStep} value={p.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="w-full accent-rose-deep" aria-valuetext={`${p.fontSize} point`} />
                <button type="button" className="h-10 w-10 shrink-0 rounded-full bg-white text-lg shadow-soft disabled:opacity-40" aria-label="Larger text" disabled={p.fontSize >= template.maxFontSize} onClick={() => update({ fontSize: Math.min(template.maxFontSize, p.fontSize + sizeStep) })}>+</button>
              </div>
            </div>
            <fieldset>
              <legend className="label">Alignment</legend>
              <div className="inline-flex rounded-full bg-white p-1 shadow-soft">
                {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as [Align, typeof AlignLeft][]).map(([a, Icon]) => (
                  <label key={a} className={`cursor-pointer rounded-full p-2.5 transition ${p.align === a ? "bg-charcoal text-white" : "hover:bg-blush"}`}>
                    <input type="radio" name="align" className="sr-only" checked={p.align === a} onChange={() => update({ align: a })} />
                    <Icon size={18} />
                    <span className="sr-only">Align {a}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {colours.length > 1 && (
            <fieldset>
              <legend className="label">Text colour</legend>
              <div className="flex flex-wrap gap-2.5">
                {colours.map((c) => (
                  <label key={c.hex} className="cursor-pointer" title={c.label}>
                    <input type="radio" name="colour" className="peer sr-only" checked={p.colour.toUpperCase() === c.hex.toUpperCase()} onChange={() => update({ colour: c.hex.toUpperCase() })} />
                    <span className="block h-9 w-9 rounded-full border-2 border-white shadow-soft ring-2 ring-transparent transition peer-checked:ring-rose-deep peer-focus-visible:ring-charcoal" style={{ background: c.hex }} />
                    <span className="sr-only">{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {(problems.length > 0 || fontError) && (
            <div role="alert" className="rounded-2xl border border-rose/40 bg-blush-light px-4 py-3 text-[14px] text-rose-deeper">
              {fontError ? "We couldn't load the fonts for the preview. Please check your connection and refresh the page." : problems.map((m) => <p key={m}>{m}</p>)}
            </div>
          )}
          {serverError && <p role="alert" className="rounded-2xl bg-blush-light px-4 py-3 text-[14px] text-rose-deeper">{serverError}</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-charcoal/10 pt-5">
            <button type="button" className="btn-secondary btn-sm" onClick={() => (blank ? undefined : setConfirmReset(true))} disabled={blank}>
              <ResetIcon size={16} /> Reset message
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setPreviewOpen(true)} disabled={!layout}>
              <EyeIcon size={16} /> Preview full card
            </button>
            <Link href={`/products/${props.slug}`} className="text-sm text-charcoal-soft underline-offset-4 hover:underline">Back to product</Link>
          </div>
        </div>

        {/* Sticky purchase bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/10 bg-cream/95 p-4 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
          <button type="button" className="btn-primary w-full py-4 text-[15px]" disabled={!layout || problems.length > 0 || pending} onClick={submit}>
            <BagIcon size={18} />
            {pending ? "Saving…" : props.editItemId ? "Save changes to cart item" : `Add personalised card to cart — ${formatAudShort(props.priceCents)}`}
          </button>
          {blank && <p className="mt-2 text-center text-xs text-charcoal-muted">No message yet — the inside will be left clean and blank.</p>}
        </div>
      </section>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lift animate-fade-in">
            <h2 id="reset-title" className="text-2xl">Reset your message?</h2>
            <p id="reset-desc" className="mt-2 text-[15px] text-charcoal-soft">This clears the name, message and sign-off, and restores the default style.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setConfirmReset(false)} autoFocus>Keep editing</button>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => {
                  setP(defaultPersonalisation(template));
                  setConfirmReset(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && layout && (
        <FullPreview
          {...panelProps}
          layout={layout}
          isVirtual={isVirtual}
          problems={problems}
          pending={pending}
          onClose={() => setPreviewOpen(false)}
          onAdd={submit}
          addLabel={props.editItemId ? "Save changes" : `Add to cart — ${formatAudShort(props.priceCents)}`}
        />
      )}
    </div>
  );
}

function FullPreview(props: {
  frontSrc: string | null;
  insideSrc: string | null;
  layout: CardLayout;
  template: TemplateSettings;
  title: string;
  isVirtual: boolean;
  problems: string[];
  pending: boolean;
  onClose: () => void;
  onAdd: () => void;
  addLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [props]);
  const panel = { frontSrc: props.frontSrc, insideSrc: props.insideSrc, layout: props.layout, template: props.template, title: props.title };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-cream p-5 shadow-lift animate-fade-in sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="preview-title" className="text-3xl">Your finished card</h2>
            <p className="mt-1 text-[15px] text-charcoal-soft">
              {props.isVirtual ? "This is how your digital card will look." : "This is how your printed PDF is laid out. Check spelling and line breaks carefully."}
            </p>
          </div>
          <button ref={closeRef} type="button" className="rounded-full p-2 hover:bg-blush" aria-label="Close preview and return to editing" onClick={props.onClose}>
            <CloseIcon size={24} />
          </button>
        </div>
        {props.isVirtual ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <figure><CardPanel kind="front" {...panel} className="rounded-md shadow-card" /><figcaption className="mt-2 text-center text-sm">Card front</figcaption></figure>
            <figure><CardPanel kind="inside-right" {...panel} className="rounded-md shadow-card" /><figcaption className="mt-2 text-center text-sm">Message page</figcaption></figure>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <figure>
              <div className="mx-auto flex max-w-3xl shadow-card">
                <div className="w-1/2"><CardPanel kind="back" {...panel} /></div>
                <div className="w-1/2"><CardPanel kind="front" {...panel} /></div>
              </div>
              <figcaption className="mt-2 text-center text-sm text-charcoal-soft">PDF page 1 — outside (back cover · front cover)</figcaption>
            </figure>
            <figure>
              <div className="mx-auto flex max-w-3xl shadow-card">
                <div className="w-1/2"><CardPanel kind="inside-left" {...panel} /></div>
                <div className="w-1/2"><CardPanel kind="inside-right" {...panel} /></div>
              </div>
              <figcaption className="mt-2 text-center text-sm text-charcoal-soft">PDF page 2 — inside (inside left · your message)</figcaption>
            </figure>
          </div>
        )}
        {props.problems.length > 0 && (
          <div role="alert" className="mt-6 rounded-2xl bg-blush-light px-4 py-3 text-[14px] text-rose-deeper">{props.problems.map((p) => <p key={p}>{p}</p>)}</div>
        )}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={props.onClose}>Back to editing</button>
          <button type="button" className="btn-primary" disabled={props.problems.length > 0 || props.pending} onClick={props.onAdd}>
            <BagIcon size={18} /> {props.pending ? "Saving…" : props.addLabel}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-charcoal-muted">Preview shown at screen resolution. Your purchased file is high resolution.</p>
      </div>
    </div>
  );
}
