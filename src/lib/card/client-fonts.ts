"use client";

import { CARD_FONTS, type FontKey } from "./constants";
import type { MeasurableFont } from "./layout";

const cache = new Map<FontKey, Promise<MeasurableFont>>();

/**
 * Loads a card font twice over: as a CSS font for on-screen rendering and as
 * a fontkit font for measuring, so line breaks match the server-generated PDF.
 */
export function loadCardFont(key: FontKey): Promise<MeasurableFont> {
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      const cfg = CARD_FONTS[key];
      const [{ default: fontkit }, res] = await Promise.all([import("@pdf-lib/fontkit"), fetch(`/fonts/${cfg.file}`)]);
      if (!res.ok) throw new Error(`Could not load font ${cfg.label}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const font = fontkit.create(bytes) as unknown as MeasurableFont;
      await document.fonts.load(`24px "${cfg.cssFamily}"`).catch(() => undefined);
      return font;
    })();
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}
