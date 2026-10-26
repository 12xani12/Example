import { z } from "zod";
import { FONT_KEYS, LIMITS, type Align, type FontKey } from "./constants";

export type Personalisation = {
  recipient: string;
  message: string;
  signOff: string;
  font: FontKey;
  fontSize: number;
  align: Align;
  colour: string;
};

/** The admin-configurable subset of a card template the editor needs. */
export type TemplateSettings = {
  textX: number;
  textY: number;
  textWidth: number;
  textHeight: number;
  allowedFonts: string[];
  defaultFont: string;
  defaultFontSize: number;
  minFontSize: number;
  maxFontSize: number;
  allowedColours: string[];
  defaultColour: string;
  defaultAlign: string;
};

/** Normalise user-entered text: NFC, unix newlines, no control characters. */
export function cleanText(input: string, maxLines?: number): string {
  let text = input.normalize("NFC").replace(/\r\n?/g, "\n").replace(/\t/g, " ");
  // Strip control characters except newline. Keep emoji etc. for the glyph check to report.
  text = text.replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B\u2028\u2029]/g, "");
  let lines = text.split("\n").map((l) => l.replace(/\s+$/g, ""));
  // Collapse runs of more than two blank lines.
  const collapsed: string[] = [];
  let blanks = 0;
  for (const line of lines) {
    blanks = line.trim() === "" ? blanks + 1 : 0;
    if (blanks <= 2) collapsed.push(line);
  }
  lines = collapsed;
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  if (maxLines !== undefined) lines = lines.slice(0, maxLines);
  return lines.join("\n");
}

export function defaultPersonalisation(t: TemplateSettings): Personalisation {
  const font = (t.allowedFonts.includes(t.defaultFont) ? t.defaultFont : t.allowedFonts[0] ?? "serif") as FontKey;
  return {
    recipient: "",
    message: "",
    signOff: "",
    font,
    fontSize: clamp(t.defaultFontSize, t.minFontSize, t.maxFontSize),
    align: (["left", "center", "right"].includes(t.defaultAlign) ? t.defaultAlign : "center") as Align,
    colour: t.allowedColours.includes(t.defaultColour) ? t.defaultColour : t.allowedColours[0] ?? "#302C2B",
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const rawSchema = z.object({
  recipient: z.string().max(LIMITS.recipient * 2).default(""),
  message: z.string().max(LIMITS.message * 2).default(""),
  signOff: z.string().max(LIMITS.signOff * 2).default(""),
  font: z.enum(FONT_KEYS as [FontKey, ...FontKey[]]),
  fontSize: z.number().finite(),
  align: z.enum(["left", "center", "right"]),
  colour: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

/**
 * Validate untrusted personalisation input against a template's rules.
 * Returns a cleaned copy, or an error message suitable for customers.
 */
export function parsePersonalisation(
  input: unknown,
  t: TemplateSettings,
): { ok: true; value: Personalisation } | { ok: false; error: string } {
  const parsed = rawSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Your personalisation details look incomplete. Please try again." };
  const v = parsed.data;
  const value: Personalisation = {
    recipient: cleanText(v.recipient, 1),
    message: cleanText(v.message),
    signOff: cleanText(v.signOff, LIMITS.signOffLines),
    font: v.font,
    fontSize: Math.round(v.fontSize * 2) / 2,
    align: v.align,
    colour: v.colour.toUpperCase(),
  };
  if ([...value.recipient].length > LIMITS.recipient) return { ok: false, error: `The recipient's name can be up to ${LIMITS.recipient} characters.` };
  if ([...value.message].length > LIMITS.message) return { ok: false, error: `Your message can be up to ${LIMITS.message} characters.` };
  if ([...value.signOff].length > LIMITS.signOff) return { ok: false, error: `The sign-off can be up to ${LIMITS.signOff} characters.` };
  if (!t.allowedFonts.includes(value.font)) return { ok: false, error: "Please choose one of the available fonts." };
  if (value.fontSize < t.minFontSize || value.fontSize > t.maxFontSize) return { ok: false, error: "Please choose a font size within the allowed range." };
  if (!t.allowedColours.map((c) => c.toUpperCase()).includes(value.colour)) return { ok: false, error: "Please choose one of the available text colours." };
  return { ok: true, value };
}

export function isBlank(p: Pick<Personalisation, "recipient" | "message" | "signOff">): boolean {
  return !p.recipient.trim() && !p.message.trim() && !p.signOff.trim();
}

/** Short human summary for carts and order emails. */
export function summarise(p: Personalisation): string {
  if (isBlank(p)) return "Blank inside";
  const parts: string[] = [];
  if (p.recipient) parts.push(`To: ${p.recipient}`);
  if (p.message) parts.push(`“${p.message.replace(/\n+/g, " ").slice(0, 70)}${p.message.length > 70 ? "…" : ""}”`);
  if (p.signOff) parts.push(`From: ${p.signOff.replace(/\n+/g, " ")}`);
  return parts.join(" · ");
}
