import "server-only";
import { readFileSync } from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { CARD_FONTS, type FontKey } from "../card/constants";
import type { MeasurableFont } from "../card/layout";

const fontDir = path.join(process.cwd(), "public", "fonts");
const bytesCache = new Map<string, Buffer>();
const fontCache = new Map<string, FullFont>();

export type GlyphPath = { toSVG(): string; scale(sx: number, sy: number): GlyphPath };

export type FontkitGlyphFont = {
  layout(text: string): {
    advanceWidth: number;
    glyphs: { path: GlyphPath }[];
    positions: { xAdvance: number; xOffset: number; yOffset: number }[];
  };
};

export function fontBytes(file: string): Buffer {
  let b = bytesCache.get(file);
  if (!b) {
    b = readFileSync(path.join(fontDir, file));
    bytesCache.set(file, b);
  }
  return b;
}

export type FullFont = Omit<MeasurableFont, "layout"> & FontkitGlyphFont;

export function cardFont(key: FontKey): FullFont {
  const file = CARD_FONTS[key].file;
  let f = fontCache.get(file);
  if (!f) {
    f = fontkit.create(fontBytes(file)) as unknown as FullFont;
    fontCache.set(file, f);
  }
  return f;
}
