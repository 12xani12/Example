import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { generatePrintableCardPdf, generateVirtualCardFiles } from "@/lib/files/card-files";
import { defaultPersonalisation, type TemplateSettings } from "@/lib/card/personalisation";
import { layoutMessage } from "@/lib/card/layout";
import { cardFont } from "@/lib/files/fonts";
import { SHEET_W, PANEL_H } from "@/lib/card/constants";

const template: TemplateSettings = {
  textX: 52, textY: 120, textWidth: 315, textHeight: 360,
  allowedFonts: ["script", "serif", "sans", "handwritten"], defaultFont: "serif",
  defaultFontSize: 18, minFontSize: 12, maxFontSize: 30,
  allowedColours: ["#302C2B", "#B4596B"], defaultColour: "#302C2B", defaultAlign: "center",
};

async function art(colour: string) {
  return sharp({ create: { width: 800, height: 1100, channels: 3, background: colour } }).png().toBuffer();
}

describe("printable card PDF", () => {
  it("produces two A4 landscape pages", async () => {
    const p = { ...defaultPersonalisation(template), recipient: "Sophie", message: "Wishing you the happiest birthday!\n\nHope your day is filled with love.", signOff: "Love, Emma xx" };
    const bytes = await generatePrintableCardPdf({ title: "Happy Birthday Blooms", template, personalisation: p, artwork: { front: await art("#F5D9D8"), inside: null, back: null } });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(Math.round(SHEET_W));
    expect(Math.round(height)).toBe(Math.round(PANEL_H));
  });

  it("refuses to print text that overflows", async () => {
    const p = { ...defaultPersonalisation(template), message: "Long message line. ".repeat(80), fontSize: 30 };
    await expect(generatePrintableCardPdf({ title: "X", template, personalisation: p, artwork: { front: null, inside: null, back: null } })).rejects.toThrow(/fit/);
  });

  it("generates virtual card images", async () => {
    const p = { ...defaultPersonalisation(template), font: "script" as const, message: "Café crème — naïve résumé ✓?" };
    const layout = layoutMessage(p, template, cardFont("script"));
    const supported = layout.unsupported.length === 0;
    const input = supported ? p : { ...p, message: "Café crème — naïve résumé" };
    const out = await generateVirtualCardFiles({ title: "Virtual", template, personalisation: input, artwork: { front: await art("#DCE3D5"), inside: null, back: null } });
    const meta = await sharp(out.messagePng).metadata();
    expect(meta.width).toBe(1080);
    expect(out.frontPng).not.toBeNull();
    expect((await PDFDocument.load(out.pdf)).getPageCount()).toBe(2);
  });
});
