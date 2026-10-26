import { describe, expect, it } from "vitest";
import { layoutMessage, layoutProblems, wrapParagraph } from "@/lib/card/layout";
import { cleanText, defaultPersonalisation, parsePersonalisation, summarise, type TemplateSettings } from "@/lib/card/personalisation";
import { cardFont } from "@/lib/files/fonts";

const t: TemplateSettings = {
  textX: 52, textY: 120, textWidth: 315, textHeight: 360,
  allowedFonts: ["script", "serif", "sans", "handwritten"], defaultFont: "serif",
  defaultFontSize: 18, minFontSize: 12, maxFontSize: 30,
  allowedColours: ["#302C2B", "#B4596B"], defaultColour: "#302C2B", defaultAlign: "center",
};
const base = defaultPersonalisation(t);

describe("cleanText", () => {
  it("normalises newlines, strips control characters and trims blank edges", () => {
    expect(cleanText("\r\n\r\nHello\r\nthere\u0007  \n\n\n\n\nBye\n")).toBe("Hello\nthere\n\n\nBye");
  });
  it("limits lines when asked", () => {
    expect(cleanText("a\nb\nc\nd", 3)).toBe("a\nb\nc");
  });
});

describe("parsePersonalisation", () => {
  it("accepts valid input and normalises colour case", () => {
    const r = parsePersonalisation({ ...base, message: "Hi", colour: "#b4596b" }, t);
    expect(r.ok && r.value.colour).toBe("#B4596B");
  });
  it("rejects fonts, colours and sizes outside the template rules", () => {
    expect(parsePersonalisation({ ...base, font: "comic" }, t).ok).toBe(false);
    expect(parsePersonalisation({ ...base, colour: "#00FF00" }, t).ok).toBe(false);
    expect(parsePersonalisation({ ...base, fontSize: 99 }, t).ok).toBe(false);
    expect(parsePersonalisation({ ...base, message: "x".repeat(601) }, t).ok).toBe(false);
  });
});

describe("layoutMessage", () => {
  it("keeps every line inside the text box", () => {
    for (const font of ["script", "serif", "sans", "handwritten"] as const) {
      const p = { ...base, font, recipient: "Sophie", message: "Wishing you the happiest birthday!\n\nHope your day is filled with love, laughter and all your favourite things.", signOff: "Love, Emma xx" };
      const l = layoutMessage(p, t, cardFont(font));
      expect(l.overflow).toBe(false);
      for (const line of l.lines) {
        expect(line.x).toBeGreaterThanOrEqual(t.textX - 0.01);
        expect(line.x + line.width).toBeLessThanOrEqual(t.textX + t.textWidth + 0.01);
      }
    }
  });

  it("preserves intentional paragraphs and line breaks", () => {
    const l = layoutMessage({ ...base, message: "One\nTwo\n\nThree" }, t, cardFont("serif"));
    expect(l.lines.map((x) => x.text)).toEqual(["One", "Two", "Three"]);
    // The blank line adds vertical space between "Two" and "Three".
    const gapA = l.lines[1].baseline - l.lines[0].baseline;
    const gapB = l.lines[2].baseline - l.lines[1].baseline;
    expect(gapB).toBeGreaterThan(gapA * 1.5);
  });

  it("breaks words that are wider than the box rather than clipping them", () => {
    const lines = wrapParagraph(cardFont("sans"), "Supercalifragilisticexpialidocious".repeat(3), 30, 200);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe("Supercalifragilisticexpialidocious".repeat(3));
  });

  it("reports overflow for very long messages instead of truncating", () => {
    const l = layoutMessage({ ...base, fontSize: 30, message: "A long heartfelt sentence for the card. ".repeat(14) }, t, cardFont("serif"));
    expect(l.overflow).toBe(true);
    expect(layoutProblems(l)[0]).toMatch(/too long/);
    expect(l.lines.map((x) => x.text).join(" ").replace(/\s+/g, " ")).toContain("heartfelt sentence");
  });

  it("flags emoji and other characters the font cannot print", () => {
    const l = layoutMessage({ ...base, message: "Happy birthday 🎉 café" }, t, cardFont("serif"));
    expect(l.unsupported).toEqual(["🎉"]);
    expect(layoutProblems(l)[0]).toMatch(/can't be printed/);
  });

  it("supports accented and typographic characters", () => {
    const l = layoutMessage({ ...base, message: "Zoë, Renée & José — “merci” ‘à bientôt’ … ©" }, t, cardFont("script"));
    expect(l.unsupported).toEqual([]);
  });

  it("leaves a blank card clean", () => {
    const l = layoutMessage(base, t, cardFont("serif"));
    expect(l.lines).toEqual([]);
    expect(summarise(base)).toBe("Blank inside");
  });

  it("aligns left and right edges to the box", () => {
    const left = layoutMessage({ ...base, align: "left", message: "Hi" }, t, cardFont("serif"));
    const right = layoutMessage({ ...base, align: "right", message: "Hi" }, t, cardFont("serif"));
    expect(left.lines[0].x).toBeCloseTo(t.textX);
    expect(right.lines[0].x + right.lines[0].width).toBeCloseTo(t.textX + t.textWidth);
  });
});
