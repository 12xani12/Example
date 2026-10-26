// Procedural botanical SVG primitives used to generate Cardly's sample artwork.
// All functions return SVG fragment strings in the caller's coordinate space.

export const ART = {
  blush: "#F5D9D8",
  blushDeep: "#EDBFC0",
  rose: "#D98291",
  roseDeep: "#B4596B",
  peach: "#F4E4D6",
  apricot: "#F2B9A0",
  coral: "#E89A8C",
  cream: "#FFF9F3",
  sage: "#DCE3D5",
  leaf: "#A3B59D",
  leafDeep: "#7C9277",
  leafDark: "#5E6F55",
  gold: "#C9A46A",
  butter: "#F3DFA2",
  lavender: "#CDBAD6",
  charcoal: "#302C2B",
  white: "#FFFFFF",
  berry: "#B5394A",
  pine: "#56705A",
};

/** Small deterministic PRNG so artwork is identical between runs. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(2);

function petalPath(len: number, width: number) {
  // Teardrop pointing up (negative y) from the origin.
  return `M0 0 C${f(width)} ${f(-len * 0.25)} ${f(width * 1.05)} ${f(-len * 0.85)} 0 ${f(-len)} C${f(-width * 1.05)} ${f(-len * 0.85)} ${f(-width)} ${f(-len * 0.25)} 0 0Z`;
}

/** Layered peony/rose style bloom. */
export function bloom(cx: number, cy: number, r: number, palette: [string, string, string], rot = 0) {
  const [outer, mid, inner] = palette;
  const ring = (count: number, len: number, width: number, colour: string, offset: number, opacity: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = rot + offset + (360 / count) * i;
      return `<path d="${petalPath(len, width)}" transform="rotate(${f(a)})" fill="${colour}" fill-opacity="${opacity}" stroke="#ffffff" stroke-opacity="0.55" stroke-width="${f(r * 0.03)}"/>`;
    }).join("");
  return `<g transform="translate(${f(cx)} ${f(cy)})">
    ${ring(8, r, r * 0.55, outer, 0, 0.95)}
    ${ring(7, r * 0.74, r * 0.42, mid, 22, 0.95)}
    ${ring(5, r * 0.46, r * 0.3, inner, 8, 0.95)}
    <circle r="${f(r * 0.14)}" fill="${inner}"/>
    <circle r="${f(r * 0.07)}" fill="#ffffff" fill-opacity="0.35"/>
  </g>`;
}

/** Simple daisy with a golden centre. */
export function daisy(cx: number, cy: number, r: number, petal = ART.white, centre = ART.butter, rot = 0) {
  const petals = Array.from({ length: 13 }, (_, i) => {
    const a = rot + (360 / 13) * i;
    return `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.17)}" ry="${f(r * 0.5)}" transform="rotate(${f(a)})" fill="${petal}" stroke="${ART.blushDeep}" stroke-width="${f(r * 0.03)}"/>`;
  }).join("");
  return `<g transform="translate(${f(cx)} ${f(cy)})">${petals}
    <circle r="${f(r * 0.26)}" fill="${centre}" stroke="${ART.gold}" stroke-width="${f(r * 0.04)}"/>
    <circle r="${f(r * 0.1)}" fill="${ART.gold}" fill-opacity="0.45"/></g>`;
}

/** Five-petal blossom (filler flower). */
export function blossom(cx: number, cy: number, r: number, colour: string, centre = ART.gold, rot = 0) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = rot + 72 * i;
    return `<circle cx="0" cy="${f(-r * 0.55)}" r="${f(r * 0.48)}" transform="rotate(${f(a)})" fill="${colour}"/>`;
  }).join("");
  return `<g transform="translate(${f(cx)} ${f(cy)})">${petals}<circle r="${f(r * 0.24)}" fill="${centre}"/></g>`;
}

export function leaf(x: number, y: number, len: number, angle: number, colour: string, vein = true) {
  const w = len * 0.3;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">
    <path d="M0 0 Q${f(len * 0.45)} ${f(-w)} ${f(len)} 0 Q${f(len * 0.45)} ${f(w)} 0 0Z" fill="${colour}"/>
    ${vein ? `<path d="M${f(len * 0.06)} 0 Q${f(len * 0.5)} ${f(-len * 0.02)} ${f(len * 0.92)} 0" stroke="#ffffff" stroke-opacity="0.45" stroke-width="${f(len * 0.025)}" fill="none"/>` : ""}
  </g>`;
}

/** Curved stem with alternating leaves. */
export function sprig(x: number, y: number, len: number, angle: number, colour: string, leaves = 7, bend = 0.18) {
  const parts: string[] = [];
  const cpY = -len * bend;
  parts.push(`<path d="M0 0 Q${f(len * 0.5)} ${f(cpY)} ${f(len)} 0" stroke="${colour}" stroke-width="${f(len * 0.018)}" fill="none" stroke-linecap="round"/>`);
  for (let i = 1; i <= leaves; i++) {
    const t = i / (leaves + 1);
    const px = len * t;
    const py = 2 * (1 - t) * t * cpY;
    const size = len * (0.22 - t * 0.08);
    const side = i % 2 === 0 ? 1 : -1;
    parts.push(leaf(px, py, size, side * 48 - 10, colour, false));
  }
  parts.push(leaf(len, 0, len * 0.14, -10, colour, false));
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">${parts.join("")}</g>`;
}

/** Eucalyptus-style stem with round leaves. */
export function eucalyptus(x: number, y: number, len: number, angle: number, colour: string) {
  const parts = [`<path d="M0 0 Q${f(len * 0.5)} ${f(-len * 0.12)} ${f(len)} 0" stroke="${ART.leafDark}" stroke-width="${f(len * 0.012)}" fill="none"/>`];
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const px = len * t;
    const py = 2 * (1 - t) * t * (-len * 0.12);
    const r = len * (0.085 - t * 0.03);
    parts.push(`<circle cx="${f(px)}" cy="${f(py - r * 0.9)}" r="${f(r)}" fill="${colour}" fill-opacity="0.92"/>`);
    parts.push(`<circle cx="${f(px + r * 0.4)}" cy="${f(py + r * 0.9)}" r="${f(r * 0.9)}" fill="${colour}" fill-opacity="0.8"/>`);
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">${parts.join("")}</g>`;
}

export function berries(x: number, y: number, r: number, colour: string, count = 5, seed = 1) {
  const rand = rng(seed);
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 2.2;
    return `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d)}" r="${f(r * (0.6 + rand() * 0.5))}" fill="${colour}"/>`;
  }).join("");
}

export function confetti(w: number, h: number, count: number, colours: string[], seed: number, avoid?: { x: number; y: number; w: number; h: number }) {
  const rand = rng(seed);
  const out: string[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 10) {
    const x = rand() * w;
    const y = rand() * h;
    if (avoid && x > avoid.x && x < avoid.x + avoid.w && y > avoid.y && y < avoid.y + avoid.h) continue;
    const c = colours[Math.floor(rand() * colours.length)];
    const kind = rand();
    const s = 2.2 + rand() * 4;
    if (kind < 0.45) out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 0.6)}" fill="${c}"/>`);
    else if (kind < 0.8) out.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(s * 0.7)}" height="${f(s * 1.9)}" rx="${f(s * 0.3)}" fill="${c}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})"/>`);
    else out.push(`<path d="M${f(x)} ${f(y)} q${f(s)} ${f(-s)} ${f(s * 2)} 0 t${f(s * 2)} 0" stroke="${c}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`);
  }
  return out.join("");
}

/** A loose bouquet cluster centred at (x, y). */
export function cluster(x: number, y: number, scale: number, seed: number, opts: { palette?: "rose" | "peach" | "lavender" | "white"; rotate?: number } = {}) {
  const rand = rng(seed);
  const palettes: Record<string, [string, string, string][]> = {
    rose: [[ART.blush, ART.rose, ART.roseDeep], [ART.peach, ART.apricot, ART.coral], [ART.blushDeep, ART.rose, ART.roseDeep]],
    peach: [[ART.peach, ART.apricot, ART.coral], [ART.cream, ART.peach, ART.apricot], [ART.blush, ART.apricot, ART.coral]],
    lavender: [[ART.lavender, "#B79FC6", "#8E6FA3"], [ART.blush, ART.rose, ART.roseDeep], [ART.cream, ART.lavender, "#B79FC6"]],
    white: [[ART.white, ART.cream, ART.peach], [ART.cream, ART.blush, ART.rose], [ART.white, ART.peach, ART.apricot]],
  };
  const pal = palettes[opts.palette ?? "rose"];
  const s = scale;
  const parts: string[] = [];
  // Greenery behind.
  for (let i = 0; i < 7; i++) {
    const a = -180 + rand() * 360;
    parts.push(rand() > 0.5 ? sprig(0, 0, 70 * s + rand() * 30 * s, a, rand() > 0.5 ? ART.leaf : ART.leafDeep, 6) : eucalyptus(0, 0, 70 * s + rand() * 25 * s, a, ART.leaf));
  }
  for (let i = 0; i < 6; i++) {
    const a = rand() * 360;
    parts.push(leaf(Math.cos(a) * 18 * s, Math.sin(a) * 18 * s, 36 * s, (a * 180) / Math.PI, i % 2 ? ART.leafDeep : ART.leaf));
  }
  // Fillers.
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const d = (28 + rand() * 26) * s;
    parts.push(blossom(Math.cos(a) * d, Math.sin(a) * d, (5 + rand() * 3) * s, rand() > 0.5 ? ART.cream : ART.blush, ART.gold, rand() * 72));
  }
  // Focal blooms.
  parts.push(bloom(-16 * s, 6 * s, 26 * s, pal[1], rand() * 40));
  parts.push(bloom(20 * s, -10 * s, 22 * s, pal[0], rand() * 40));
  parts.push(daisy(14 * s, 22 * s, 13 * s, ART.white, ART.butter, rand() * 30));
  parts.push(bloom(-6 * s, -24 * s, 14 * s, pal[2], rand() * 40));
  parts.push(berries(30 * s, 10 * s, 2.4 * s, ART.roseDeep, 5, seed + 3));
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(opts.rotate ?? 0)})">${parts.join("")}</g>`;
}

/** Ring of greenery and flowers. */
export function wreath(cx: number, cy: number, R: number, seed: number, flowers = 5, palette: "rose" | "peach" | "lavender" | "white" = "rose") {
  const rand = rng(seed);
  const parts: string[] = [];
  const steps = 22;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    const tangent = (a * 180) / Math.PI + 90;
    parts.push(leaf(x, y, R * 0.28, tangent + (rand() - 0.5) * 50, i % 3 ? ART.leaf : ART.leafDeep));
    parts.push(leaf(x, y, R * 0.22, tangent + 150 + (rand() - 0.5) * 40, ART.leafDeep));
  }
  for (let i = 0; i < flowers; i++) {
    const a = (i / flowers) * Math.PI * 2 + 0.6;
    parts.push(cluster(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R / 190, seed + i * 7, { palette }));
  }
  return parts.join("");
}

export function balloon(x: number, y: number, r: number, colour: string, stringLen: number) {
  return `<g transform="translate(${f(x)} ${f(y)})">
    <path d="M0 ${f(r * 1.2)} q${f(-r * 0.25)} ${f(stringLen * 0.3)} 0 ${f(stringLen * 0.6)} t0 ${f(stringLen * 0.4)}" stroke="${ART.charcoal}" stroke-opacity="0.45" stroke-width="0.8" fill="none"/>
    <ellipse cx="0" cy="0" rx="${f(r)}" ry="${f(r * 1.18)}" fill="${colour}"/>
    <path d="M${f(-r * 0.12)} ${f(r * 1.16)} l${f(r * 0.12)} ${f(r * 0.12)} l${f(r * 0.12)} ${f(-r * 0.12)}z" fill="${colour}"/>
    <ellipse cx="${f(-r * 0.35)}" cy="${f(-r * 0.45)}" rx="${f(r * 0.18)}" ry="${f(r * 0.32)}" fill="#ffffff" fill-opacity="0.45" transform="rotate(-25 ${f(-r * 0.35)} ${f(-r * 0.45)})"/>
  </g>`;
}

export function star(x: number, y: number, r: number, colour: string, rot = 0) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + (rot * Math.PI) / 180;
    const rr = i % 2 ? r * 0.45 : r;
    return `${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${colour}"/>`;
}

export function hollyLeaf(x: number, y: number, len: number, angle: number) {
  const w = len * 0.32;
  const d = `M0 0 L${f(len * 0.15)} ${f(-w * 0.8)} L${f(len * 0.3)} ${f(-w * 0.5)} L${f(len * 0.45)} ${f(-w)} L${f(len * 0.6)} ${f(-w * 0.55)} L${f(len * 0.78)} ${f(-w * 0.85)} L${f(len)} 0 L${f(len * 0.78)} ${f(w * 0.85)} L${f(len * 0.6)} ${f(w * 0.55)} L${f(len * 0.45)} ${f(w)} L${f(len * 0.3)} ${f(w * 0.5)} L${f(len * 0.15)} ${f(w * 0.8)} Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"><path d="${d}" fill="${ART.pine}" stroke="${ART.leafDark}" stroke-width="0.6" stroke-linejoin="round"/><path d="M0 0 L${f(len * 0.95)} 0" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8"/></g>`;
}

export function heart(x: number, y: number, size: number, colour: string) {
  const s = size / 10;
  return `<path transform="translate(${f(x - 5 * s)} ${f(y - 5 * s)}) scale(${f(s)})" d="M5 9.2 C2 7 0 5.2 0 3.1 0 1.4 1.3 0 3 0 4 0 4.6.5 5 1.2 5.4.5 6 0 7 0 8.7 0 10 1.4 10 3.1 10 5.2 8 7 5 9.2Z" fill="${colour}"/>`;
}

/** Soft paper texture: radial washes plus fine speckles. */
export function paper(w: number, h: number, base: string, wash: string, seed: number) {
  const rand = rng(seed);
  const specks = Array.from({ length: 140 }, () =>
    `<circle cx="${f(rand() * w)}" cy="${f(rand() * h)}" r="${f(0.25 + rand() * 0.5)}" fill="#8a6a4f" fill-opacity="${f(0.04 + rand() * 0.05)}"/>`,
  ).join("");
  const id = `wash${seed}`;
  return `<defs><radialGradient id="${id}" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="${wash}" stop-opacity="0.9"/><stop offset="1" stop-color="${base}" stop-opacity="1"/></radialGradient></defs>
  <rect width="${f(w)}" height="${f(h)}" fill="url(#${id})"/>${specks}`;
}

/** Hand-painted style wildflower: thin stem, a few leaves and a simple open bloom. */
export function wildflower(x: number, baseY: number, height: number, colour: string, seed: number, kind: 0 | 1 | 2 | 3 = 0) {
  const rand = rng(seed);
  const lean = (rand() - 0.5) * height * 0.25;
  const tx = x + lean, ty = baseY - height;
  const parts = [`<path d="M${f(x)} ${f(baseY)} Q${f(x + lean * 0.2)} ${f(baseY - height * 0.5)} ${f(tx)} ${f(ty)}" stroke="${ART.leafDeep}" stroke-width="${f(Math.max(1, height * 0.012))}" fill="none" stroke-linecap="round"/>`];
  for (let i = 0; i < 2; i++) {
    const t = 0.35 + i * 0.25;
    const lx = x + lean * t * 0.6, ly = baseY - height * t;
    parts.push(leaf(lx, ly, height * 0.16, i % 2 ? -35 : -145, i % 2 ? ART.leaf : ART.leafDeep, false));
  }
  const r = height * (0.09 + rand() * 0.03);
  if (kind === 0) parts.push(blossom(tx, ty, r, colour, ART.gold, rand() * 72));
  else if (kind === 1) {
    // Cosmos-style: 8 rounded petals.
    parts.push(`<g transform="translate(${f(tx)} ${f(ty)})">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="${f(-r * 0.62)}" rx="${f(r * 0.32)}" ry="${f(r * 0.62)}" transform="rotate(${i * 45 + rand() * 10})" fill="${colour}" fill-opacity="0.92"/>`).join("")}<circle r="${f(r * 0.22)}" fill="${ART.gold}"/></g>`);
  } else if (kind === 2) {
    // Lavender / snapdragon spike.
    for (let i = 0; i < 7; i++) parts.push(`<ellipse cx="${f(tx + (i % 2 ? 1 : -1) * r * 0.25)}" cy="${f(ty + i * r * 0.45)}" rx="${f(r * 0.28)}" ry="${f(r * 0.36)}" fill="${colour}" fill-opacity="${f(0.95 - i * 0.07)}"/>`);
  } else {
    parts.push(daisy(tx, ty, r * 1.1, colour, ART.butter, rand() * 30));
  }
  return parts.join("");
}

/** A meadow of wildflowers along a baseline. */
export function meadow(x0: number, x1: number, baseY: number, maxH: number, seed: number, colours = [ART.blushDeep, ART.lavender, ART.apricot, ART.butter, ART.rose, ART.white]) {
  const rand = rng(seed);
  const out: string[] = [];
  const n = Math.round((x1 - x0) / 22);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + rand() * 0.8) / n) * (x1 - x0);
    out.push(wildflower(x, baseY + rand() * 6, maxH * (0.55 + rand() * 0.45), colours[Math.floor(rand() * colours.length)], seed * 31 + i, Math.floor(rand() * 4) as 0 | 1 | 2 | 3));
  }
  return out.join("");
}

export const KRAFT = { light: "#E9DAC6", mid: "#D9C2A2", dark: "#B99671", twine: "#F4EBDD" };

/** Kraft-paper gift box seen front-on, tied with twine. */
export function giftBox(x: number, y: number, w: number, h: number, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
    <rect x="${f(-w / 2 + 6)}" y="${f(-h / 2 + 12)}" width="${f(w)}" height="${f(h)}" rx="4" fill="#3a2a28" opacity="0.18" filter="url(#sh)"/>
    <rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="4" fill="${KRAFT.mid}"/>
    <rect x="${f(-w / 2 - 4)}" y="${f(-h / 2)}" width="${f(w + 8)}" height="${f(h * 0.22)}" rx="4" fill="${KRAFT.light}"/>
    <rect x="${f(-w * 0.04)}" y="${f(-h / 2)}" width="${f(w * 0.08)}" height="${f(h)}" fill="${KRAFT.twine}"/>
    <rect x="${f(-w / 2 - 4)}" y="${f(-h * 0.02)}" width="${f(w + 8)}" height="${f(h * 0.06)}" fill="${KRAFT.twine}" opacity="0.9"/>
    <path d="M0 ${f(-h / 2)} c${f(-w * 0.25)} ${f(-h * 0.25)} ${f(-w * 0.3)} ${f(h * 0.05)} 0 0 c${f(w * 0.3)} ${f(h * 0.05)} ${f(w * 0.25)} ${f(-h * 0.25)} 0 0" stroke="${KRAFT.twine}" stroke-width="${f(w * 0.035)}" fill="none"/>
  </g>`;
}

/** Big glossy houseplant leaves (pothos-like) radiating from a point. */
export function plant(x: number, y: number, size: number, seed: number) {
  const rand = rng(seed);
  return Array.from({ length: 9 }, (_, i) => {
    const a = -170 + i * 22 + rand() * 12;
    const len = size * (0.6 + rand() * 0.4);
    const col = i % 3 === 0 ? ART.leafDark : i % 3 === 1 ? ART.leafDeep : "#6E8A63";
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})">
      <path d="M0 0 L${f(len * 0.45)} 0" stroke="${ART.leafDark}" stroke-width="${f(size * 0.02)}"/>
      <path d="M${f(len * 0.4)} 0 C${f(len * 0.55)} ${f(-len * 0.3)} ${f(len * 0.95)} ${f(-len * 0.25)} ${f(len)} 0 C${f(len * 0.95)} ${f(len * 0.25)} ${f(len * 0.55)} ${f(len * 0.3)} ${f(len * 0.4)} 0Z" fill="${col}"/>
      <path d="M${f(len * 0.42)} 0 L${f(len * 0.96)} 0" stroke="#ffffff" stroke-opacity="0.3" stroke-width="${f(size * 0.01)}"/>
    </g>`;
  }).join("");
}

/** Small hand-drawn doodles (hearts, swashes) used as accents. */
export function doodleHeart(x: number, y: number, s: number, colour: string) {
  return `<path transform="translate(${f(x)} ${f(y)}) scale(${f(s / 10)})" d="M5 9C2 7 .3 5 .5 3 .7 1 2.7.2 4.2 1.3L5 2.2 5.9 1.3C7.4.1 9.4 1 9.5 3 9.7 5 8 7 5 9Z" fill="none" stroke="${colour}" stroke-width="${f(10 / s * 1.4)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
