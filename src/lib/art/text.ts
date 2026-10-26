// Renders text as SVG paths (no system fonts needed when rasterising with sharp).
import { readFileSync } from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

type Glyph = { path: { toSVG(): string } };
type Font = {
  unitsPerEm: number;
  layout(text: string): { glyphs: Glyph[]; positions: { xAdvance: number; xOffset: number; yOffset: number }[]; advanceWidth: number };
};

const cache = new Map<string, Font>();
export const ART_FONTS = {
  script: "GreatVibes-Regular.ttf",
  serif: "CormorantGaramond-SemiBold.ttf",
  serifMedium: "CormorantGaramond-Medium.ttf",
  serifItalic: "CormorantGaramond-MediumItalic.ttf",
  sans: "Jost-Regular.ttf",
  sansLight: "Jost-Light.ttf",
  sansMedium: "Jost-Medium.ttf",
  hand: "Caveat-Medium.ttf",
} as const;
export type ArtFont = keyof typeof ART_FONTS;

function font(name: ArtFont): Font {
  let fnt = cache.get(name);
  if (!fnt) {
    fnt = fontkit.create(readFileSync(path.join(process.cwd(), "public", "fonts", ART_FONTS[name]))) as unknown as Font;
    cache.set(name, fnt);
  }
  return fnt;
}

export function textWidth(name: ArtFont, text: string, size: number, tracking = 0) {
  const fnt = font(name);
  return (fnt.layout(text).advanceWidth / fnt.unitsPerEm) * size + tracking * Math.max(0, [...text].length - 1);
}

/**
 * @param anchor horizontal alignment relative to x
 * @param tracking extra space between characters, in user units
 */
export function svgText(
  name: ArtFont,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  opts: { anchor?: "start" | "middle" | "end"; tracking?: number; opacity?: number } = {},
) {
  const fnt = font(name);
  const tracking = opts.tracking ?? 0;
  const run = fnt.layout(text);
  const s = size / fnt.unitsPerEm;
  const width = textWidth(name, text, size, tracking);
  const startX = opts.anchor === "middle" ? x - width / 2 : opts.anchor === "end" ? x - width : x;
  let pen = 0;
  const paths = run.glyphs.map((g, i) => {
    const p = run.positions[i];
    const gx = startX + (pen + p.xOffset) * s + tracking * i;
    pen += p.xAdvance;
    const d = g.path.toSVG();
    return d ? `<path transform="translate(${gx.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)} ${(-s).toFixed(5)})" d="${d}"/>` : "";
  });
  return `<g fill="${fill}"${opts.opacity !== undefined ? ` fill-opacity="${opts.opacity}"` : ""}>${paths.join("")}</g>`;
}
