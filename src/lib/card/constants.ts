// Shared by the browser editor and the server-side file generators so the
// on-screen preview and the printed PDF use identical geometry.

/** A5 panel in PDF points (148 x 210 mm). */
export const PANEL_W = 419.53;
export const PANEL_H = 595.28;
/** A4 landscape sheet (297 x 210 mm) holding two A5 panels side by side. */
export const SHEET_W = 841.89;
export const SHEET_H = PANEL_H;
/** The two panels are 1 mm narrower than A4, so they're centred with a 0.5 mm margin. */
export const SHEET_OFFSET = (SHEET_W - PANEL_W * 2) / 2;

export const LIMITS = {
  recipient: 60,
  message: 600,
  signOff: 80,
  signOffLines: 3,
};

export type FontKey = "script" | "serif" | "sans" | "handwritten";

export const CARD_FONTS: Record<
  FontKey,
  { label: string; file: string; cssFamily: string; lineHeight: number; recipientScale: number }
> = {
  script: { label: "Elegant Script", file: "GreatVibes-Regular.ttf", cssFamily: "CardlyScript", lineHeight: 1.3, recipientScale: 1.25 },
  serif: { label: "Classic Serif", file: "CormorantGaramond-Medium.ttf", cssFamily: "CardlySerif", lineHeight: 1.3, recipientScale: 1.2 },
  sans: { label: "Modern Sans Serif", file: "Jost-Light.ttf", cssFamily: "CardlySans", lineHeight: 1.45, recipientScale: 1.15 },
  handwritten: { label: "Handwritten Style", file: "Caveat-Medium.ttf", cssFamily: "CardlyHand", lineHeight: 1.25, recipientScale: 1.2 },
};

export const FONT_KEYS = Object.keys(CARD_FONTS) as FontKey[];

export const BRAND_TEXT_COLOURS: { hex: string; label: string }[] = [
  { hex: "#302C2B", label: "Charcoal" },
  { hex: "#B4596B", label: "Dusty Rose" },
  { hex: "#5E6F55", label: "Sage" },
  { hex: "#8A6A4F", label: "Warm Taupe" },
  { hex: "#3F4A6B", label: "Ink Blue" },
];

export type Align = "left" | "center" | "right";
