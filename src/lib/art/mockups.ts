// Lifestyle mockups composed from rendered card artwork.
import { ART, cluster, confetti, eucalyptus, paper, sprig } from "./flora";
import { svgDoc } from "./designs";

const dataUri = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

const shadowDefs = `<defs>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="shs" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>`;

function envelope(x: number, y: number, w: number, h: number, rot: number, colour: string) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="${-w / 2 + 8}" y="${-h / 2 + 14}" width="${w}" height="${h}" rx="6" fill="#3a2a28" opacity="0.18" filter="url(#sh)"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="${colour}"/>
    <path d="M${-w / 2} ${-h / 2} L0 ${h * 0.08} L${w / 2} ${-h / 2}" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>
    <path d="M${-w / 2} ${h / 2} L${-w * 0.08} ${0} M${w / 2} ${h / 2} L${w * 0.08} 0" stroke="#000" stroke-opacity="0.06" stroke-width="2"/>
  </g>`;
}

function placedCard(png: Buffer, cx: number, cy: number, width: number, rot: number) {
  const h = width * (595 / 420);
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <rect x="${-width / 2 + 10}" y="${-h / 2 + 18}" width="${width}" height="${h}" fill="#3a2a28" opacity="0.22" filter="url(#sh)"/>
    <image x="${-width / 2}" y="${-h / 2}" width="${width}" height="${h}" preserveAspectRatio="xMidYMid slice" href="${dataUri(png)}" xlink:href="${dataUri(png)}"/>
    <rect x="${-width / 2}" y="${-h / 2}" width="${width}" height="${h}" fill="none" stroke="#000" stroke-opacity="0.05"/>
  </g>`;
}

export type MockupTone = "blush" | "peach" | "sage" | "cream";
const TONES: Record<MockupTone, [string, string, string]> = {
  blush: [ART.blush, ART.cream, ART.peach],
  peach: [ART.peach, ART.cream, ART.blush],
  sage: [ART.sage, ART.cream, ART.white],
  cream: [ART.cream, ART.blush, ART.sage],
};

/** Square product lifestyle mockup: card + envelope + florals. */
export function lifestyleMockup(png: Buffer, tone: MockupTone, seed: number) {
  const [bg, wash, env] = TONES[tone];
  return svgDoc(1200, 1200, `${shadowDefs}${paper(1200, 1200, bg, wash, seed)}
    ${envelope(470, 700, 640, 440, -9, env)}
    ${eucalyptus(1150, 120, 330, 150, ART.leaf)}
    ${placedCard(png, 690, 590, 500, 4)}
    ${cluster(230, 980, 2.3, seed + 5, { palette: tone === "sage" ? "white" : "rose", rotate: 15 })}
    ${sprig(1000, 1150, 260, -120, ART.leafDeep, 8)}`, 1200, 1200);
}

/** Open card mockup showing the inside message page beside the front. */
export function insideMockup(front: Buffer, inside: Buffer, tone: MockupTone, seed: number) {
  const [bg, wash] = TONES[tone];
  return svgDoc(1200, 1200, `${shadowDefs}${paper(1200, 1200, bg, wash, seed)}
    ${placedCard(front, 365, 600, 430, -3)}
    ${placedCard(inside, 835, 600, 430, 3)}
    ${sprig(80, 1180, 240, -70, ART.leafDeep, 7)}`, 1200, 1200);
}

/** Transparent hero composition: fanned cards, envelopes and florals. */
export function heroComposition(cards: Buffer[]) {
  const [a, b, c] = cards;
  return svgDoc(1400, 1100, `${shadowDefs}
    ${envelope(470, 760, 560, 380, -14, ART.peach)}
    ${envelope(1040, 830, 520, 360, 10, ART.white)}
    ${cluster(1230, 220, 2.2, 801, { palette: "rose", rotate: 150 })}
    ${placedCard(c, 1010, 520, 380, 9)}
    ${placedCard(a, 420, 500, 380, -8)}
    ${placedCard(b, 720, 560, 420, 1)}
    ${cluster(220, 930, 2.6, 803, { palette: "peach", rotate: 20 })}
    ${eucalyptus(1300, 1060, 360, -150, ART.leaf)}
    ${confetti(1400, 1100, 26, [ART.rose, ART.gold, ART.leaf], 805, { x: 220, y: 120, w: 980, h: 900 })}`, 1400, 1100);
}

/** Wide promotional banner art (transparent background). */
export function promoComposition(cards: Buffer[]) {
  const [a, b] = cards;
  return svgDoc(1000, 700, `${shadowDefs}
    ${envelope(470, 470, 480, 330, -6, ART.white)}
    ${placedCard(a, 380, 340, 300, -7)}
    ${placedCard(b, 660, 370, 320, 6)}
    ${cluster(860, 120, 1.8, 901, { palette: "rose", rotate: 160 })}
    ${cluster(180, 600, 1.9, 903, { palette: "white", rotate: 30 })}
    ${sprig(950, 680, 220, -110, ART.leafDeep, 8)}`, 1000, 700);
}

/** Square category tile: tinted background with one tilted product. */
export function categoryTile(png: Buffer, tone: MockupTone, seed: number, portrait = true) {
  const [bg, wash] = TONES[tone];
  const width = portrait ? 380 : 470;
  return svgDoc(800, 800, `${shadowDefs}${paper(800, 800, bg, wash, seed)}
    ${sprig(60, 760, 260, -60, ART.leafDeep, 7)}
    ${placedCard(png, 420, 410, width, seed % 2 ? 5 : -5)}
    ${cluster(690, 690, 1.25, seed + 9, { palette: seed % 3 === 0 ? "peach" : "rose" })}`, 800, 800);
}

/** A4 portrait product (planner, wall art...) shown framed on a soft background. */
export function a4Mockup(png: Buffer, tone: MockupTone, seed: number) {
  const [bg, wash] = TONES[tone];
  const w = 560, h = w * (842 / 595);
  return svgDoc(1200, 1200, `${shadowDefs}${paper(1200, 1200, bg, wash, seed)}
    <g transform="translate(600 610) rotate(-2)">
      <rect x="${-w / 2 + 12}" y="${-h / 2 + 20}" width="${w}" height="${h}" fill="#3a2a28" opacity="0.2" filter="url(#sh)"/>
      <image x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" href="${dataUri(png)}" xlink:href="${dataUri(png)}"/>
    </g>
    ${cluster(170, 1030, 2, seed + 2, { palette: "rose" })}
    ${eucalyptus(1160, 140, 300, 160, ART.leaf)}`, 1200, 1200);
}
