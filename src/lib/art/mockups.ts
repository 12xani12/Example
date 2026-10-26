// Lifestyle mockups composed from rendered card artwork.
import { ART, KRAFT, balloon, cluster, confetti, daisy, doodleHeart, eucalyptus, giftBox, paper, plant, rng, sprig } from "./flora";
import { svgText } from "./text";
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

/** Transparent hero composition: two upright cards with kraft gift boxes and a houseplant. */
export function heroComposition(cards: Buffer[]) {
  const [a, b] = cards;
  return svgDoc(1400, 1100, `${shadowDefs}
    <ellipse cx="760" cy="960" rx="640" ry="70" fill="#C9A98C" opacity="0.18" filter="url(#sh)"/>
    ${plant(1180, 470, 420, 3)}
    ${giftBox(1170, 760, 360, 300, 0)}
    ${giftBox(330, 840, 300, 220, -4)}
    ${placedCard(a, 620, 540, 540, -3)}
    ${placedCard(b, 1080, 660, 400, 4)}
`, 1400, 1100);
}

/** Desk scene for the promo banner: keyboard, coffee and a hand-lettered card (transparent edges). */
export function deskScene(cardPng: Buffer) {
  const keys: string[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) keys.push(`<rect x="${30 + c * 44}" y="${30 + r * 44}" width="38" height="38" rx="6" fill="#FFFFFF" stroke="#E4DED8"/>`);
  return svgDoc(1100, 700, `${shadowDefs}
    <g transform="translate(-60 -40) rotate(-12)"><rect x="10" y="10" width="620" height="250" rx="22" fill="#EEE9E4"/>${keys.join("")}</g>
    <g transform="translate(150 520)">
      <circle r="150" fill="#3a2a28" opacity="0.15" filter="url(#sh)"/>
      <circle r="140" fill="#FFFFFF"/><circle r="104" fill="#C79A72"/><circle r="104" fill="url(#crema)"/>
      <ellipse cx="-20" cy="-10" rx="40" ry="18" fill="#F3E6D6" opacity="0.6" transform="rotate(-20)"/>
    </g>
    <defs><radialGradient id="crema"><stop offset="0.6" stop-color="#D9B48F"/><stop offset="1" stop-color="#9C6E4B"/></radialGradient></defs>
    ${placedCard(cardPng, 600, 360, 400, -9)}
    ${daisy(990, 95, 70, ART.butter, ART.gold, 10)}
    ${cluster(950, 600, 1.8, 77, { palette: "rose", rotate: 200 })}`, 1100, 700);
}

/** Wide category banner: pastel balloons or florals at the edges, open centre for the title. */
export function categoryBanner(kind: "balloons" | "florals", seed: number) {
  const rand = rng(seed);
  const cols = ["#9CC3D5", ART.coral, ART.butter, ART.blushDeep, ART.leaf, ART.lavender];
  const sides = kind === "balloons"
    ? [[90, 150], [200, 110], [150, 260], [1380, 120], [1500, 200], [1440, 300]].map(([x, y], i) => balloon(x, y, 52 + rand() * 14, cols[(i + seed) % cols.length], 200)).join("")
    : `${cluster(120, 200, 2.3, seed, { palette: "rose", rotate: 30 })}${cluster(1480, 220, 2.3, seed + 1, { palette: "peach", rotate: 210 })}${eucalyptus(0, 380, 300, -30, ART.leaf)}${eucalyptus(1600, 40, 300, 150, ART.leaf)}`;
  return svgDoc(1600, 400, `${paper(1600, 400, ART.blush, ART.peach, seed)}
    ${confetti(1600, 400, 70, [ART.rose, ART.gold, ART.leaf, "#9CC3D5"], seed + 2, { x: 420, y: 60, w: 760, h: 280 })}
    ${sides}`, 1600, 400);
}

/** Hand-lettered card used inside the promo desk scene. */
export function promoCard() {
  return svgDoc(420, 595, `${paper(420, 595, "#F7E2DE", ART.cream, 61)}
    ${["Small", "Cards", "Big", "Moments"].map((w, i) => svgText("hand", w, 210, 190 + i * 84, 84, ART.rose, { anchor: "middle" })).join("")}
    ${doodleHeart(195, 520, 30, ART.rose)}`, 840, 1190);
}

/** Square category tile: tinted background with one tilted product. */
export function categoryTile(png: Buffer, tone: MockupTone, seed: number, portrait = true) {
  const surfaces: Record<MockupTone, [string, string]> = {
    blush: [KRAFT.light, "#F3E7DA"], peach: ["#EADBC8", KRAFT.light], sage: ["#DCE3D5", "#EEF1E9"], cream: ["#F1E6DA", "#FBF6EF"],
  };
  const [bg, wash] = surfaces[tone];
  const width = portrait ? 430 : 500;
  return svgDoc(800, 640, `${shadowDefs}${paper(800, 640, bg, wash, seed)}
    ${seed % 2 ? sprig(40, 620, 230, -60, ART.leafDeep, 7) : ""}
    ${placedCard(png, 400, 320, width * 0.9, seed % 2 ? 3 : -3)}`, 800, 640);
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
