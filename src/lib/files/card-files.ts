import "server-only";
import sharp from "sharp";
import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import { PANEL_H, PANEL_W, SHEET_W, SHEET_OFFSET, type FontKey } from "../card/constants";
import { layoutMessage, type CardLayout } from "../card/layout";
import type { Personalisation, TemplateSettings } from "../card/personalisation";
import { cardFont } from "./fonts";

export type CardArtwork = {
  front: Buffer | null;
  inside: Buffer | null;
  back: Buffer | null;
};

// 300 dpi A5 panel.
const PANEL_PX = { w: 1748, h: 2480 };

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

async function panelJpeg(input: Buffer, w = PANEL_PX.w, h = PANEL_PX.h) {
  return sharp(input).resize({ width: w, height: h, fit: "cover", position: "centre" }).flatten({ background: "#ffffff" })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
}

/**
 * Draw text as vector glyph outlines. This uses exactly the same font metrics
 * as the browser preview and avoids font-subsetting problems in PDF viewers
 * and printers. Text stays perfectly sharp at any print resolution.
 */
function drawTextAsPaths(page: PDFPage, fontKey: FontKey, text: string, x: number, baselineFromTop: number, size: number, colour: ReturnType<typeof rgb>) {
  const font = cardFont(fontKey);
  const run = font.layout(text);
  const s = size / font.unitsPerEm;
  let pen = 0;
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    // Flip the y-up glyph outline: drawSvgPath treats path y values as pointing down.
    const d = glyph.path.scale(1, -1).toSVG();
    if (d) {
      page.drawSvgPath(d, {
        x: x + (pen + pos.xOffset) * s,
        y: PANEL_H - baselineFromTop + pos.yOffset * s,
        scale: s,
        color: colour,
        borderWidth: 0,
      });
    }
    pen += pos.xAdvance;
  });
}

function drawLayout(page: PDFPage, layout: CardLayout, offsetX: number) {
  const colour = hexToRgb(layout.colour);
  for (const line of layout.lines) drawTextAsPaths(page, layout.font, line.text, offsetX + line.x, line.baseline, line.size, colour);
}

function textWidth(fontKey: FontKey, text: string, size: number) {
  const f = cardFont(fontKey);
  return (f.layout(text).advanceWidth / f.unitsPerEm) * size;
}

async function drawBackCover(doc: PDFDocument, page: PDFPage, art: Buffer | null, offsetX: number) {
  if (art) {
    const img = await doc.embedJpg(await panelJpeg(art));
    page.drawImage(img, { x: offsetX, y: 0, width: PANEL_W, height: PANEL_H });
    return;
  }
  // Default back: a small, quiet Cardly mark (same geometry as the editor preview).
  const cx = offsetX + PANEL_W / 2;
  const logoW = textWidth("script", "Cardly", 22);
  drawTextAsPaths(page, "script", "Cardly", cx - 6 - logoW / 2, PANEL_H - 70, 22, rgb(0.19, 0.17, 0.17));
  page.drawSvgPath("M5 9.2C2 7 0 5.2 0 3.1 0 1.4 1.3 0 3 0c1 0 1.6.5 2 1.2C5.4.5 6 0 7 0c1.7 0 3 1.4 3 3.1 0 2.1-2 3.9-5 6.1Z", {
    x: cx + 26,
    y: 90,
    scale: 0.9,
    color: rgb(0.85, 0.51, 0.57),
  });
  const tagW = textWidth("sans", "Small Cards. Big Moments.", 7.5);
  drawTextAsPaths(page, "sans", "Small Cards. Big Moments.", cx - tagW / 2, PANEL_H - 52, 7.5, rgb(0.43, 0.4, 0.4));
}

/**
 * Printable greeting card: A4 landscape, two pages.
 * Page 1 (outside): back cover on the left half, front cover on the right half.
 * Page 2 (inside): blank inside-left, message on the inside-right.
 * Print double-sided, flipping on the short edge, then fold in half to A5.
 */
export async function generatePrintableCardPdf(opts: {
  title: string;
  template: TemplateSettings;
  personalisation: Personalisation | null;
  artwork: CardArtwork;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${opts.title} — Cardly`);
  doc.setAuthor("Cardly");
  doc.setCreator("Cardly");
  doc.setSubject("Printable greeting card — A4, folds to A5");

  const left = SHEET_OFFSET;
  const right = SHEET_OFFSET + PANEL_W;
  const outside = doc.addPage([SHEET_W, PANEL_H]);
  await drawBackCover(doc, outside, opts.artwork.back, left);
  if (opts.artwork.front) {
    const img = await doc.embedJpg(await panelJpeg(opts.artwork.front));
    outside.drawImage(img, { x: right, y: 0, width: PANEL_W, height: PANEL_H });
  }

  const inside = doc.addPage([SHEET_W, PANEL_H]);
  if (opts.artwork.inside) {
    const img = await doc.embedJpg(await panelJpeg(opts.artwork.inside));
    inside.drawImage(img, { x: right, y: 0, width: PANEL_W, height: PANEL_H });
  }
  if (opts.personalisation) {
    const layout = layoutMessage(opts.personalisation, opts.template, cardFont(opts.personalisation.font));
    assertPrintable(layout);
    drawLayout(inside, layout, right);
  }
  return doc.save();
}

function assertPrintable(layout: CardLayout) {
  if (layout.overflow) throw new Error("Message does not fit inside the text area.");
  if (layout.unsupported.length) throw new Error(`Unsupported characters: ${layout.unsupported.join(" ")}`);
}

/** Render laid-out text as vector glyph paths so image output never depends on system fonts. */
function layoutToSvgPaths(layout: CardLayout, scale: number): string {
  const font = cardFont(layout.font);
  const unitsPerEm = font.unitsPerEm;
  return layout.lines
    .map((line) => {
      const run = font.layout(line.text);
      const s = line.size / unitsPerEm;
      let pen = 0;
      const parts = run.glyphs.map((glyph, i) => {
        const pos = run.positions[i];
        const gx = line.x + (pen + pos.xOffset) * s;
        pen += pos.xAdvance;
        const d = glyph.path.toSVG();
        if (!d) return "";
        return `<path transform="translate(${(gx * scale).toFixed(2)} ${(line.baseline * scale).toFixed(2)}) scale(${(s * scale).toFixed(5)} ${(-s * scale).toFixed(5)})" d="${d}"/>`;
      });
      return parts.join("");
    })
    .join("");
}

/** Message page as a PNG (used for virtual cards and admin previews). */
export async function renderMessagePng(opts: {
  template: TemplateSettings;
  personalisation: Personalisation | null;
  insideArt: Buffer | null;
  width?: number;
}): Promise<Buffer> {
  const width = opts.width ?? 1080;
  const scale = width / PANEL_W;
  const height = Math.round(PANEL_H * scale);
  const base = opts.insideArt
    ? sharp(await sharp(opts.insideArt).resize({ width, height, fit: "cover" }).png().toBuffer())
    : sharp({ create: { width, height, channels: 4, background: "#FFFDFB" } });
  if (!opts.personalisation) return base.png().toBuffer();
  const layout = layoutMessage(opts.personalisation, opts.template, cardFont(opts.personalisation.font));
  assertPrintable(layout);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="${layout.colour}">${layoutToSvgPaths(layout, scale)}</g></svg>`;
  return base.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
}

/** Virtual card deliverables: front image, message image and a two-page digital PDF. */
export async function generateVirtualCardFiles(opts: {
  title: string;
  template: TemplateSettings;
  personalisation: Personalisation | null;
  artwork: CardArtwork;
}): Promise<{ frontPng: Buffer | null; messagePng: Buffer; pdf: Uint8Array }> {
  const width = 1080;
  const height = Math.round((PANEL_H / PANEL_W) * width);
  const frontPng = opts.artwork.front
    ? await sharp(opts.artwork.front).resize({ width, height, fit: "cover" }).png().toBuffer()
    : null;
  const messagePng = await renderMessagePng({
    template: opts.template,
    personalisation: opts.personalisation,
    insideArt: opts.artwork.inside,
    width,
  });

  const doc = await PDFDocument.create();
  doc.setTitle(`${opts.title} — Cardly`);
  doc.setAuthor("Cardly");
  if (frontPng) {
    const page = doc.addPage([PANEL_W, PANEL_H]);
    page.drawImage(await doc.embedJpg(await panelJpeg(frontPng)), { x: 0, y: 0, width: PANEL_W, height: PANEL_H });
  }
  const page = doc.addPage([PANEL_W, PANEL_H]);
  if (opts.artwork.inside) {
    page.drawImage(await doc.embedJpg(await panelJpeg(opts.artwork.inside)), { x: 0, y: 0, width: PANEL_W, height: PANEL_H });
  }
  if (opts.personalisation) {
    const layout = layoutMessage(opts.personalisation, opts.template, cardFont(opts.personalisation.font));
    drawLayout(page, layout, 0);
  }
  return { frontPng, messagePng, pdf: await doc.save() };
}
