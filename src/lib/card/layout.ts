import { CARD_FONTS, type FontKey } from "./constants";
import type { Personalisation, TemplateSettings } from "./personalisation";

/** Minimal font interface satisfied by a fontkit font on both client and server. */
export type MeasurableFont = {
  unitsPerEm: number;
  ascent: number;
  descent: number;
  layout(text: string): { advanceWidth: number };
  hasGlyphForCodePoint(codePoint: number): boolean;
};

export type LaidOutLine = {
  text: string;
  /** Left x of the line in panel points. */
  x: number;
  /** Baseline y measured from the top of the panel, in points. */
  baseline: number;
  size: number;
  width: number;
};

export type CardLayout = {
  lines: LaidOutLine[];
  contentHeight: number;
  boxHeight: number;
  overflow: boolean;
  unsupported: string[];
  font: FontKey;
  colour: string;
};

export function measure(font: MeasurableFont, text: string, size: number): number {
  if (!text) return 0;
  return (font.layout(text).advanceWidth / font.unitsPerEm) * size;
}

/** Characters (other than whitespace) that the font cannot draw, e.g. emoji. */
export function findUnsupported(font: MeasurableFont, text: string): string[] {
  const bad = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (ch === "\n" || ch === " " || cp === 0xfe0f || cp === 0x200d) continue;
    if (!font.hasGlyphForCodePoint(cp)) bad.add(ch);
  }
  return [...bad];
}

/** Break one paragraph into lines no wider than `maxWidth`. */
export function wrapParagraph(font: MeasurableFont, text: string, size: number, maxWidth: number): string[] {
  if (text.trim() === "") return [""];
  const words = text.split(/ +/).filter((w, i) => w !== "" || i === 0);
  const lines: string[] = [];
  let current = "";
  const pushWord = (word: string) => {
    // Words wider than the box are broken across lines rather than clipped.
    if (measure(font, word, size) <= maxWidth) return [word];
    const parts: string[] = [];
    let chunk = "";
    for (const ch of Array.from(word)) {
      if (chunk && measure(font, chunk + ch, size) > maxWidth) {
        parts.push(chunk);
        chunk = ch;
      } else chunk += ch;
    }
    if (chunk) parts.push(chunk);
    return parts;
  };
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(font, candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    const pieces = pushWord(word);
    current = pieces.pop() ?? "";
    lines.push(...pieces);
  }
  lines.push(current);
  return lines;
}

function withComma(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return /[,.!?:;]$/.test(trimmed) ? trimmed : `${trimmed},`;
}

/**
 * Lay out the inside message in the template's text box.
 * Blocks: recipient line, message paragraphs, sign-off, separated by a gap.
 * The whole block is vertically centred in the box.
 */
export function layoutMessage(p: Personalisation, t: TemplateSettings, font: MeasurableFont): CardLayout {
  const cfg = CARD_FONTS[p.font];
  const size = p.fontSize;
  const lineHeight = size * cfg.lineHeight;
  const gap = size * 0.9;
  const asc = font.ascent / font.unitsPerEm;
  const desc = font.descent / font.unitsPerEm;

  type Row = { text: string; size: number; lh: number } | { gap: number };
  const rows: Row[] = [];
  const addBlock = (lines: string[], s: number, lh: number) => {
    if (!lines.length) return;
    if (rows.length) rows.push({ gap });
    for (const text of lines) rows.push({ text, size: s, lh });
  };

  const recipient = withComma(p.recipient);
  if (recipient) {
    const s = size * cfg.recipientScale;
    addBlock(wrapParagraph(font, recipient, s, t.textWidth), s, s * cfg.lineHeight);
  }
  if (p.message.trim()) {
    const lines = p.message.split("\n").flatMap((para) => wrapParagraph(font, para, size, t.textWidth));
    addBlock(lines, size, lineHeight);
  }
  if (p.signOff.trim()) {
    const lines = p.signOff.split("\n").flatMap((para) => wrapParagraph(font, para, size, t.textWidth));
    addBlock(lines, size, lineHeight);
  }

  const contentHeight = rows.reduce((h, r) => h + ("gap" in r ? r.gap : r.lh), 0);
  const overflow = contentHeight > t.textHeight + 0.01;
  let y = t.textY + Math.max(0, (t.textHeight - contentHeight) / 2);
  const lines: LaidOutLine[] = [];
  for (const row of rows) {
    if ("gap" in row) {
      y += row.gap;
      continue;
    }
    const width = measure(font, row.text, row.size);
    const x =
      p.align === "left" ? t.textX : p.align === "right" ? t.textX + t.textWidth - width : t.textX + (t.textWidth - width) / 2;
    // Centre the glyph box (ascent..descent) within the line box.
    const glyphBox = (asc - desc) * row.size;
    const baseline = y + (row.lh - glyphBox) / 2 + asc * row.size;
    if (row.text) lines.push({ text: row.text, x, baseline, size: row.size, width });
    y += row.lh;
  }

  const all = [p.recipient, p.message, p.signOff].join("\n");
  return {
    lines,
    contentHeight,
    boxHeight: t.textHeight,
    overflow,
    unsupported: findUnsupported(font, all),
    font: p.font,
    colour: p.colour,
  };
}

/** Problems that must be fixed before a personalised card can be bought. */
export function layoutProblems(layout: CardLayout): string[] {
  const problems: string[] = [];
  if (layout.unsupported.length) {
    problems.push(
      `Some characters can't be printed in this font: ${layout.unsupported.join(" ")}. Please remove them or try another font.`,
    );
  }
  if (layout.overflow) {
    problems.push("Your message is a little too long to fit inside the card. Please shorten it or reduce the font size.");
  }
  return problems;
}
