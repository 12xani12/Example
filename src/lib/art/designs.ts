// Sample artwork for Cardly's demonstration products.
import { ART, balloon, berries, blossom, bloom, cluster, confetti, daisy, eucalyptus, heart, hollyLeaf, leaf, paper, rng, sprig, star, wreath } from "./flora";
import { svgText } from "./text";

const W = 420;
const H = 595;

export function svgDoc(w: number, h: number, body: string, pxW?: number, pxH?: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${pxW ?? w}" height="${pxH ?? h}">${body}</svg>`;
}

const card = (body: string) => svgDoc(W, H, body, 1748, 2480);

const caps = (text: string, y: number, size = 13, fill = ART.charcoal, tracking = 4) =>
  svgText("sansMedium", text.toUpperCase(), W / 2, y, size, fill, { anchor: "middle", tracking });

export type DesignId =
  | "birthday-blooms" | "confetti-celebration" | "make-a-wish" | "amazing-year" | "age-number" | "birthday-smiles"
  | "congratulations" | "thank-you" | "thinking-of-you" | "merry-christmas" | "anniversary" | "new-baby"
  | "wedding" | "virtual-bouquet" | "virtual-congrats" | "virtual-thanks";

export const CARD_DESIGNS: Record<DesignId, () => string> = {
  "birthday-blooms": () =>
    card(`${paper(W, H, ART.cream, ART.blush, 11)}
      ${wreath(W / 2, 262, 142, 21, 5, "rose")}
      ${svgText("script", "Happy", W / 2, 250, 48, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "Birthday", W / 2, 302, 50, ART.roseDeep, { anchor: "middle" })}
      ${caps("to you", 470, 12, ART.charcoal, 6)}
      ${heart(W / 2, 498, 10, ART.rose)}`),

  "confetti-celebration": () =>
    card(`${paper(W, H, ART.cream, ART.peach, 12)}
      ${confetti(W, H, 170, [ART.rose, ART.gold, ART.leaf, ART.apricot, ART.blushDeep, ART.lavender], 5, { x: 60, y: 200, w: 300, h: 210 })}
      ${svgText("script", "Let's", W / 2, 268, 58, ART.roseDeep, { anchor: "middle" })}
      ${svgText("serif", "CELEBRATE", W / 2, 330, 44, ART.charcoal, { anchor: "middle", tracking: 5 })}
      ${star(W / 2, 372, 7, ART.gold)}`),

  "make-a-wish": () => {
    const cake = `
      <rect x="120" y="330" width="180" height="120" rx="14" fill="${ART.white}" stroke="${ART.blushDeep}" stroke-width="2"/>
      <path d="M120 352 q15 22 30 0 q15 22 30 0 q15 22 30 0 q15 22 30 0 q15 22 30 0 q15 22 30 0 v-10 a12 12 0 0 0 -12 -12 h-156 a12 12 0 0 0 -12 12z" fill="${ART.rose}"/>
      <rect x="150" y="262" width="120" height="72" rx="12" fill="${ART.blush}" stroke="${ART.blushDeep}" stroke-width="2"/>
      <path d="M150 282 q10 16 20 0 q10 16 20 0 q10 16 20 0 q10 16 20 0 q10 16 20 0 q10 16 20 0 v-8 a12 12 0 0 0 -12 -12 h-96 a12 12 0 0 0 -12 12z" fill="${ART.white}"/>
      <rect x="104" y="446" width="212" height="12" rx="6" fill="${ART.gold}" fill-opacity="0.7"/>
      ${[176, 210, 244].map((x) => `<rect x="${x - 4}" y="222" width="8" height="42" rx="3" fill="${ART.peach}" stroke="${ART.apricot}" stroke-width="1.5"/>
        <path d="M${x} 196 q9 12 0 22 q-9 -10 0 -22z" fill="${ART.butter}" stroke="${ART.gold}" stroke-width="1"/>`).join("")}
      ${[140, 175, 210, 245, 280].map((x, i) => blossom(x, 392 + (i % 2) * 14, 6, i % 2 ? ART.cream : ART.blush, ART.gold, i * 20)).join("")}`;
    return card(`${paper(W, H, ART.peach, ART.cream, 13)}
      ${confetti(W, 180, 40, [ART.rose, ART.gold, ART.leaf], 9)}
      ${svgText("script", "Make a Wish", W / 2, 140, 58, ART.roseDeep, { anchor: "middle" })}
      ${cake}
      ${cluster(112, 452, 0.55, 31, { palette: "peach" })}
      ${cluster(312, 452, 0.5, 33, { palette: "rose" })}
      ${caps("happy birthday", 526, 12, ART.charcoal, 6)}`);
  },

  "amazing-year": () => {
    const garland = [60, 150, 240, 330].map((x, i) => cluster(x + 15, 70 + (i % 2) * 22, 0.62, 40 + i, { palette: i % 2 ? "peach" : "rose", rotate: i * 25 })).join("");
    return card(`${paper(W, H, ART.cream, ART.blush, 14)}
      ${garland}
      ${svgText("serifItalic", "Here's to another", W / 2, 296, 30, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "Amazing Year", W / 2, 360, 58, ART.roseDeep, { anchor: "middle" })}
      ${sprig(150, 420, 120, 0, ART.leafDeep, 9, 0.05)}
      ${caps("happy birthday", 470, 11, ART.charcoal, 6)}`);
  },

  "age-number": () => {
    const rand = rng(77);
    const cols = [ART.rose, ART.blushDeep, ART.apricot, ART.gold, ART.leaf];
    const balloons = [[270, 120], [322, 150], [236, 176], [300, 210], [350, 96]]
      .map(([x, y], i) => balloon(x, y, 26 + rand() * 6, cols[i], 150)).join("");
    return card(`${paper(W, H, ART.blush, ART.cream, 15)}
      ${balloons}
      ${svgText("serifItalic", "Age is just", 54, 392, 34, ART.charcoal)}
      ${svgText("script", "a number", 64, 456, 66, ART.roseDeep)}
      ${svgText("sansMedium", "HAPPY BIRTHDAY", 60, 508, 11, ART.charcoal, { tracking: 5 })}
      ${cluster(66, 140, 0.6, 51, { palette: "white" })}`);
  },

  "birthday-smiles": () => {
    const rand = rng(4);
    const daisies = Array.from({ length: 14 }, (_, i) => daisy(20 + i * 29 + rand() * 10, 470 + rand() * 90, 14 + rand() * 10, ART.white, ART.butter, rand() * 40)).join("");
    const stems = Array.from({ length: 10 }, (_, i) => sprig(30 + i * 38, 600, 90 + rand() * 50, -90 + (rand() - 0.5) * 30, ART.leafDeep, 4)).join("");
    return card(`${paper(W, H, ART.sage, ART.cream, 16)}
      ${stems}${daisies}
      ${caps("sending", 160, 13, ART.charcoal, 8)}
      ${svgText("script", "Birthday", W / 2, 230, 62, ART.roseDeep, { anchor: "middle" })}
      ${svgText("script", "Smiles", W / 2, 296, 62, ART.charcoal, { anchor: "middle" })}
      ${daisy(W / 2, 352, 10, ART.white, ART.butter)}`);
  },

  congratulations: () => {
    const rand = rng(8);
    const stars = Array.from({ length: 26 }, () => star(rand() * W, rand() * 180 + (rand() > 0.5 ? 0 : 420), 3 + rand() * 6, rand() > 0.4 ? ART.gold : ART.blushDeep, rand() * 40)).join("");
    return card(`${paper(W, H, ART.cream, ART.sage, 17)}
      ${stars}
      ${sprig(30, 300, 130, -40, ART.leafDeep, 8)}
      ${sprig(390, 300, 130, -140, ART.leafDeep, 8)}
      ${svgText("script", "Congratulations!", W / 2, 312, 46, ART.roseDeep, { anchor: "middle" })}
      ${caps("you did it", 356, 13, ART.charcoal, 7)}
      ${cluster(W / 2, 470, 0.7, 61, { palette: "peach" })}`);
  },

  "thank-you": () =>
    card(`${paper(W, H, ART.cream, ART.blush, 18)}
      ${cluster(54, 74, 1.05, 70, { palette: "rose", rotate: 20 })}
      ${cluster(370, 530, 1.05, 72, { palette: "peach", rotate: 200 })}
      ${svgText("script", "Thank You", W / 2, 304, 74, ART.charcoal, { anchor: "middle" })}
      ${caps("so much", 350, 14, ART.roseDeep, 9)}`),

  "thinking-of-you": () =>
    card(`${paper(W, H, ART.cream, ART.sage, 19)}
      ${eucalyptus(80, 520, 300, -70, ART.leaf)}
      ${eucalyptus(120, 540, 240, -82, ART.sage)}
      ${sprig(60, 560, 220, -60, ART.leafDeep, 9)}
      ${[[150, 300], [178, 260], [130, 350]].map(([x, y], i) => blossom(x, y, 9, ART.white, ART.butter, i * 30)).join("")}
      ${svgText("serifItalic", "Thinking", 300, 238, 40, ART.charcoal, { anchor: "middle" })}
      ${svgText("serifItalic", "of You", 300, 284, 40, ART.charcoal, { anchor: "middle" })}
      ${heart(300, 316, 9, ART.rose)}`),

  "merry-christmas": () => {
    const parts: string[] = [];
    const cx = W / 2, cy = 270, R = 146;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      parts.push(hollyLeaf(x, y, 40, (a * 180) / Math.PI + 100 + (i % 2 ? 40 : -20)));
      if (i % 3 === 0) parts.push(berries(x, y, 4, ART.berry, 3, i));
      if (i % 4 === 1) parts.push(sprig(x, y, 40, (a * 180) / Math.PI + 60, ART.pine, 5));
    }
    const snow = confetti(W, H, 70, ["#ffffff"], 23);
    return card(`${paper(W, H, "#F7EFE6", ART.cream, 20)}${snow}
      ${parts.join("")}
      ${svgText("script", "Merry", W / 2, 260, 50, ART.berry, { anchor: "middle" })}
      ${svgText("script", "Christmas", W / 2, 312, 46, ART.pine, { anchor: "middle" })}
      ${caps("& a happy new year", 486, 11, ART.charcoal, 5)}`);
  },

  anniversary: () => {
    const rand = rng(31);
    const hearts = Array.from({ length: 20 }, () => heart(rand() * W, rand() * H, 6 + rand() * 8, rand() > 0.5 ? ART.blushDeep : ART.rose)).join("");
    return card(`${paper(W, H, ART.blush, ART.cream, 21)}
      <g opacity="0.55">${hearts}</g>
      ${wreath(W / 2, 270, 142, 90, 4, "lavender")}
      ${svgText("script", "Happy", W / 2, 258, 44, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "Anniversary", W / 2, 308, 42, ART.roseDeep, { anchor: "middle" })}
      ${caps("with love", 470, 12, ART.charcoal, 7)}`);
  },

  wedding: () =>
    card(`${paper(W, H, ART.cream, ART.peach, 24)}
      ${cluster(W / 2, 120, 1.1, 120, { palette: "white" })}
      ${eucalyptus(W / 2 - 10, 120, 150, 150, ART.leaf)}
      ${eucalyptus(W / 2 + 10, 120, 150, 30, ART.leaf)}
      ${svgText("serifItalic", "On your", W / 2, 300, 32, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "Wedding Day", W / 2, 370, 62, ART.roseDeep, { anchor: "middle" })}
      ${caps("wishing you a lifetime of love", 420, 9.5, ART.charcoal, 3)}
      ${heart(W / 2, 458, 9, ART.rose)}`),

  "new-baby": () => {
    const rand = rng(41);
    const stars = Array.from({ length: 22 }, () => star(rand() * W, rand() * H, 3 + rand() * 4, rand() > 0.5 ? ART.gold : ART.leaf, rand() * 30)).join("");
    return card(`${paper(W, H, ART.sage, ART.cream, 22)}
      <g opacity="0.7">${stars}</g>
      <path d="M110 410 a40 40 0 0 1 60 -38 a52 52 0 0 1 96 6 a36 36 0 0 1 44 32 z" fill="#ffffff" fill-opacity="0.9"/>
      ${svgText("script", "Welcome", W / 2, 230, 62, ART.leafDark, { anchor: "middle" })}
      ${svgText("serifItalic", "little one", W / 2, 280, 34, ART.charcoal, { anchor: "middle" })}
      ${cluster(320, 400, 0.55, 140, { palette: "peach" })}
      ${caps("congratulations", 480, 11, ART.charcoal, 6)}`);
  },

  "virtual-bouquet": () =>
    card(`${paper(W, H, ART.peach, ART.cream, 25)}
      ${cluster(W / 2, 380, 1.55, 150, { palette: "rose" })}
      ${sprig(W / 2, 500, 150, -100, ART.leafDeep, 6)}
      ${svgText("script", "Happy Birthday", W / 2, 150, 52, ART.roseDeep, { anchor: "middle" })}
      ${caps("a little bouquet for you", 190, 10, ART.charcoal, 4)}`),

  "virtual-congrats": () =>
    card(`${paper(W, H, ART.sage, ART.cream, 26)}
      ${confetti(W, H, 150, [ART.gold, ART.rose, ART.white, ART.leafDeep], 61, { x: 50, y: 210, w: 320, h: 170 })}
      ${svgText("script", "Congrats!", W / 2, 300, 76, ART.leafDark, { anchor: "middle" })}
      ${caps("so proud of you", 350, 12, ART.charcoal, 6)}`),

  "virtual-thanks": () => {
    const rand = rng(91);
    const ring = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      return daisy(W / 2 + Math.cos(a) * 140, 290 + Math.sin(a) * 140, 16 + rand() * 6, ART.white, ART.butter, rand() * 30);
    }).join("");
    return card(`${paper(W, H, ART.blush, ART.cream, 27)}
      ${Array.from({ length: 18 }, (_, i) => leaf(W / 2 + Math.cos((i / 18) * Math.PI * 2 + 0.17) * 140, 290 + Math.sin((i / 18) * Math.PI * 2 + 0.17) * 140, 26, (i / 18) * 360 + 80, ART.leaf)).join("")}
      ${ring}
      ${svgText("script", "Thanks a", W / 2, 278, 50, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "Bunch", W / 2, 336, 58, ART.roseDeep, { anchor: "middle" })}`);
  },
};

/** Soft inside-right background with a delicate sprig at the bottom. */
export function insideArtwork(accent: "rose" | "sage" | "peach" | "holly" = "rose") {
  const colour = accent === "sage" ? ART.leafDeep : accent === "holly" ? ART.pine : ART.leaf;
  const flower = accent === "holly" ? berries(W / 2, 548, 3.6, ART.berry, 4, 3) : blossom(W / 2, 548, 7, accent === "peach" ? ART.apricot : ART.blush, ART.gold);
  return card(`<rect width="${W}" height="${H}" fill="#FFFDFB"/>
    ${sprig(W / 2 - 4, 548, 70, 180, colour, 5, 0.12)}
    ${sprig(W / 2 + 4, 548, 70, 0, colour, 5, 0.12)}
    ${flower}`);
}

// ---------------------------------------------------------------- downloads

const A4W = 595, A4H = 842;
const a4 = (body: string) => svgDoc(A4W, A4H, body, 2480, 3508);

export const DOWNLOAD_DESIGNS = {
  planner: () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const boxes = days.map((d, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 40 + col * 262, y = 170 + row * 150;
      return `<rect x="${x}" y="${y}" width="250" height="138" rx="10" fill="#ffffff" stroke="${ART.blushDeep}" stroke-width="1.2"/>
        ${svgText("sansMedium", d.toUpperCase(), x + 14, y + 24, 10, ART.roseDeep, { tracking: 3 })}
        ${[0, 1, 2, 3].map((l) => `<line x1="${x + 14}" x2="${x + 236}" y1="${y + 50 + l * 22}" y2="${y + 50 + l * 22}" stroke="${ART.blushDeep}" stroke-width="0.7"/>`).join("")}`;
    }).join("");
    const notesX = 40 + 262, notesY = 170 + 3 * 150;
    return a4(`${paper(A4W, A4H, ART.cream, ART.blush, 30)}
      ${cluster(70, 70, 0.75, 200, { palette: "rose" })}
      ${svgText("script", "Weekly Planner", A4W / 2, 96, 54, ART.charcoal, { anchor: "middle" })}
      ${svgText("sansMedium", "WEEK OF ________________", A4W / 2, 132, 10, ART.charcoal, { anchor: "middle", tracking: 3 })}
      ${boxes}
      <rect x="${notesX}" y="${notesY}" width="250" height="138" rx="10" fill="${ART.sage}" fill-opacity="0.6"/>
      ${svgText("sansMedium", "NOTES & PRIORITIES", notesX + 14, notesY + 24, 10, ART.leafDark, { tracking: 3 })}`);
  },

  invitation: () =>
    card(`${paper(W, H, ART.cream, ART.peach, 31)}
      ${cluster(60, 70, 0.9, 210, { palette: "peach", rotate: 30 })}
      ${cluster(360, 525, 0.9, 212, { palette: "rose", rotate: 210 })}
      ${svgText("script", "You're Invited", W / 2, 190, 52, ART.roseDeep, { anchor: "middle" })}
      ${caps("join us to celebrate", 226, 10, ART.charcoal, 4)}
      ${["FOR", "DATE", "TIME", "PLACE", "RSVP"].map((label, i) => `
        ${svgText("sansMedium", label, 80, 282 + i * 44, 9, ART.charcoal, { tracking: 3 })}
        <line x1="140" x2="340" y1="${284 + i * 44}" y2="${284 + i * 44}" stroke="${ART.blushDeep}" stroke-width="1"/>`).join("")}`),

  giftTags: () => {
    const tags = Array.from({ length: 6 }, (_, i) => {
      const col = i % 2;
      const x = 50 + col * 260, y = 60 + Math.floor(i / 2) * 250;
      const label = ["For You", "With Love", "Merry & Bright", "Thank You", "Happy Birthday", "Just Because"][i];
      const pal = (["rose", "peach", "white", "lavender", "rose", "peach"] as const)[i];
      return `<g>
        <path d="M${x + 30} ${y} h175 a12 12 0 0 1 12 12 v196 a12 12 0 0 1 -12 12 h-175 l-30 -30 v-160z" fill="#ffffff" stroke="${ART.blushDeep}" stroke-width="1.2"/>
        <circle cx="${x + 26}" cy="${y + 32}" r="6" fill="none" stroke="${ART.charcoal}" stroke-opacity="0.4"/>
        ${cluster(x + 118, y + 70, 0.55, 300 + i, { palette: pal })}
        ${svgText("script", label, x + 118, y + 162, 26, ART.roseDeep, { anchor: "middle" })}
        <line x1="${x + 50}" x2="${x + 186}" y1="${y + 196}" y2="${y + 196}" stroke="${ART.blushDeep}"/>
      </g>`;
    }).join("");
    return a4(`<rect width="${A4W}" height="${A4H}" fill="${ART.cream}"/>${tags}`);
  },

  wallArt: () =>
    a4(`${paper(A4W, A4H, ART.cream, ART.sage, 33)}
      ${wreath(A4W / 2, 330, 170, 400, 6, "peach")}
      ${svgText("serifItalic", "Bloom", A4W / 2, 310, 58, ART.charcoal, { anchor: "middle" })}
      ${svgText("serifItalic", "where you are", A4W / 2, 360, 34, ART.charcoal, { anchor: "middle" })}
      ${svgText("script", "planted", A4W / 2, 420, 64, ART.roseDeep, { anchor: "middle" })}
      ${sprig(A4W / 2 - 100, 640, 200, 0, ART.leafDeep, 11, 0.06)}`),

  checklist: () =>
    a4(`${paper(A4W, A4H, ART.cream, ART.peach, 34)}
      ${cluster(530, 70, 0.8, 500, { palette: "rose" })}
      ${svgText("script", "Party Planning", 50, 100, 48, ART.roseDeep)}
      ${svgText("sansMedium", "CHECKLIST", 54, 132, 12, ART.charcoal, { tracking: 6 })}
      ${["Choose a date & venue", "Write the guest list", "Send invitations", "Plan the menu", "Order the cake", "Decorations & flowers", "Music playlist", "Games & activities", "Party favours", "Thank-you cards"].map((t, i) => `
        <rect x="56" y="${178 + i * 56}" width="18" height="18" rx="4" fill="#ffffff" stroke="${ART.roseDeep}" stroke-width="1.3"/>
        ${svgText("serifMedium", t, 90, 193 + i * 56, 18, ART.charcoal)}
        <line x1="90" x2="540" y1="${204 + i * 56}" y2="${204 + i * 56}" stroke="${ART.blushDeep}" stroke-width="0.7"/>`).join("")}`),
};

export type DownloadDesign = keyof typeof DOWNLOAD_DESIGNS;
