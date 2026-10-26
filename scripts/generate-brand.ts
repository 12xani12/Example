// Regenerates /public/brand assets: npx tsx scripts/generate-brand.ts
import sharp from "sharp";
import { writeFileSync } from "fs";
import { svgText, textWidth } from "../src/lib/art/text";
import { heart, paper, cluster, ART } from "../src/lib/art/flora";
import { svgDoc } from "../src/lib/art/designs";

const out = "public/brand";

function logoSvg(colour = ART.charcoal) {
  const size = 120;
  const w = textWidth("script", "Cardly", size);
  const W = Math.ceil(w + 60), H = 150;
  return { svg: svgDoc(W, H, `${svgText("script", "Cardly", 10, 110, size, colour)}${heart(w + 32, 42, 22, ART.rose)}`), W, H };
}

(async () => {
  const logo = logoSvg();
  writeFileSync(`${out}/cardly-logo.svg`, logo.svg);
  await sharp(Buffer.from(logo.svg)).resize({ width: 600 }).png().toFile(`${out}/cardly-logo.png`);

  const icon = svgDoc(512, 512, `<rect width="512" height="512" rx="112" fill="${ART.blush}"/>${svgText("script", "C", 256, 360, 330, ART.charcoal, { anchor: "middle" })}${heart(380, 150, 60, ART.rose)}`);
  await sharp(Buffer.from(icon)).resize(512).png().toFile(`${out}/icon.png`);
  await sharp(Buffer.from(icon)).resize(32).png().toFile("src/app/icon.png");

  const og = svgDoc(1200, 630, `${paper(1200, 630, ART.blush, ART.cream, 3)}
    ${cluster(120, 540, 2.2, 11, { palette: "rose" })}${cluster(1100, 90, 2.2, 13, { palette: "peach", rotate: 180 })}
    ${svgText("script", "Cardly", 600, 300, 170, ART.charcoal, { anchor: "middle" })}
    ${heart(820, 175, 34, ART.rose)}
    ${svgText("sansMedium", "SMALL CARDS. BIG MOMENTS.", 600, 400, 30, ART.roseDeep, { anchor: "middle", tracking: 8 })}
    ${svgText("serifItalic", "Printable & virtual greeting cards · Instant download", 600, 460, 34, ART.charcoal, { anchor: "middle" })}`);
  await sharp(Buffer.from(og)).png().toFile(`${out}/og-default.png`);
  console.log("Brand assets written to", out);
})();
