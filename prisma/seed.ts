/**
 * Seeds a fresh Cardly database: admin user, settings, categories and
 * demonstration products with generated artwork.
 *
 *   npm run db:seed            # safe to re-run; skips existing products
 *   npm run db:seed -- --reset # removes all products & categories first
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { CARD_DESIGNS, DOWNLOAD_DESIGNS, insideArtwork, type DesignId, type DownloadDesign } from "../src/lib/art/designs";
import { a4Mockup, categoryTile, heroComposition, insideMockup, lifestyleMockup, promoComposition } from "../src/lib/art/mockups";
import { storePrivateArtwork, storePublicImage } from "../src/lib/images";
import { storage } from "../src/lib/storage";
import { renderMessagePng } from "../src/lib/files/card-files";
import { DEFAULT_BUSINESS, DEFAULT_DOWNLOADS, DEFAULT_HOMEPAGE } from "../src/lib/settings";
import { CATEGORIES, PRODUCTS } from "./seed-data";

const prisma = new PrismaClient();
const reset = process.argv.includes("--reset");

const render = (svg: string, width?: number) => sharp(Buffer.from(svg)).resize(width ? { width } : undefined).png().toBuffer();

const cardPngCache = new Map<string, Buffer>();
async function designPng(design: DesignId | DownloadDesign, width = 1748) {
  const key = `${design}@${width}`;
  if (!cardPngCache.has(key)) {
    const svg = design in CARD_DESIGNS ? CARD_DESIGNS[design as DesignId]() : DOWNLOAD_DESIGNS[design as DownloadDesign]();
    cardPngCache.set(key, await render(svg, width));
  }
  return cardPngCache.get(key)!;
}

const SAMPLE_MESSAGE = {
  recipient: "Sophie",
  message: "Wishing you the happiest birthday!\n\nHope your day is filled with love, laughter and all your favourite things.",
  signOff: "Love, Emma xx",
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`Admin ${email} already exists (password unchanged).`);
    return;
  }
  await prisma.user.create({ data: { email, name: "Cardly Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Created admin ${email}`);
}

async function seedSettings() {
  const home = await prisma.setting.findUnique({ where: { key: "homepage" } });
  if (home && !reset) return;
  const hero = await storePublicImage(
    await sharp(Buffer.from(heroComposition([await designPng("birthday-blooms", 900), await designPng("thank-you", 900), await designPng("make-a-wish", 900)]))).png().toBuffer(),
    "site",
  );
  const promo = await storePublicImage(
    await sharp(Buffer.from(promoComposition([await designPng("congratulations", 800), await designPng("virtual-bouquet", 800)]))).png().toBuffer(),
    "site",
  );
  await prisma.setting.upsert({
    where: { key: "homepage" },
    create: { key: "homepage", value: { ...DEFAULT_HOMEPAGE, heroImageKey: hero.key, promoImageKey: promo.key, seasonalCategorySlug: "christmas", seasonalHeading: "The Christmas Collection", seasonalText: "Printable and personalised Christmas cards and gift tags — ready in minutes." } },
    update: { value: { ...DEFAULT_HOMEPAGE, heroImageKey: hero.key, promoImageKey: promo.key, seasonalCategorySlug: "christmas", seasonalHeading: "The Christmas Collection", seasonalText: "Printable and personalised Christmas cards and gift tags — ready in minutes." } },
  });
  for (const [key, value] of [["business", DEFAULT_BUSINESS], ["downloads", DEFAULT_DOWNLOADS]] as const) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
  console.log("Settings seeded");
}

async function seedCategories() {
  let order = 0;
  for (const c of CATEGORIES) {
    order += 10;
    const existing = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (existing) continue;
    let imageKey: string | null = null;
    if (c.tile) {
      const png = await designPng(c.tile.design, 900);
      const portrait = !["planner", "giftTags", "wallArt", "checklist"].includes(c.tile.design);
      const tile = await render(categoryTile(png, c.tile.tone, order, portrait));
      imageKey = (await storePublicImage(tile, "categories")).key;
    }
    await prisma.category.create({ data: { name: c.name, slug: c.slug, group: c.group, description: c.description, sortOrder: order, showOnHome: !!c.home, imageKey } });
  }
  console.log(`Categories: ${await prisma.category.count()}`);
}

async function demoPdfFromImage(png: Buffer, size: [number, number]) {
  const doc = await PDFDocument.create();
  doc.setTitle("Cardly sample download");
  const page = doc.addPage(size);
  const img = await doc.embedPng(png);
  page.drawImage(img, { x: 0, y: 0, width: size[0], height: size[1] });
  return Buffer.from(await doc.save());
}

async function seedProducts() {
  let sort = 0;
  for (const p of PRODUCTS) {
    sort += 10;
    if (await prisma.product.findUnique({ where: { slug: p.slug } })) continue;
    const categories = await prisma.category.findMany({ where: { slug: { in: p.categories } }, select: { id: true } });
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        shortDescription: p.short,
        description: p.description,
        whatsIncluded: p.whatsIncluded ?? "",
        sizeInfo: p.sizeInfo ?? "",
        type: p.type,
        format: p.type === "VIRTUAL_CARD" ? "VIRTUAL" : "PRINTABLE",
        status: "PUBLISHED",
        isFeatured: !!p.featured,
        isNewArrival: !!p.isNew,
        isDemo: true,
        tags: p.tags.map((t) => t.toLowerCase()),
        sortOrder: sort,
        categories: { create: categories.map((c) => ({ categoryId: c.id })) },
        variants: {
          create: [
            { kind: "READY_MADE" as const, priceCents: p.ready },
            ...(p.personalised ? [{ kind: "PERSONALISED" as const, priceCents: p.personalised }] : []),
          ],
        },
      },
    });
    const folder = `products/${product.id}`;

    if (p.art.kind === "card") {
      const front = await designPng(p.art.design);
      const insideSvgPng = await render(insideArtwork(p.art.inside));
      const frontArtKey = await storePrivateArtwork(front, folder);
      const insideArtKey = await storePrivateArtwork(insideSvgPng, folder);
      const frontImg = await storePublicImage(front, folder);
      const insidePreview = await storePublicImage(await sharp(insideSvgPng).resize({ width: 900 }).png().toBuffer(), folder);
      const template = await prisma.cardTemplate.create({
        data: {
          productId: product.id,
          frontArtKey,
          insideArtKey,
          frontPreviewKey: frontImg.key,
          insidePreviewKey: insidePreview.key,
          readyMadeMessage: p.art.readyMadeMessage ?? "",
          defaultFont: p.art.defaultFont ?? "serif",
          defaultFontSize: p.art.defaultFont === "script" ? 24 : 18,
        },
      });
      const sample = await renderMessagePng({
        template,
        personalisation: { ...SAMPLE_MESSAGE, font: template.defaultFont as "serif", fontSize: template.defaultFontSize, align: "center", colour: template.defaultColour },
        insideArt: insideSvgPng,
        width: 900,
      });
      const smallFront = await designPng(p.art.design, 900);
      const life = await storePublicImage(await render(lifestyleMockup(smallFront, p.art.tone, sort)), folder);
      const open = await storePublicImage(await render(insideMockup(smallFront, sample, p.art.tone, sort + 1)), folder);
      await prisma.productImage.createMany({
        data: [
          { productId: product.id, key: frontImg.key, role: "FRONT", sortOrder: 0, alt: `${p.title} — front cover`, width: frontImg.width, height: frontImg.height },
          { productId: product.id, key: life.key, role: "LIFESTYLE", sortOrder: 1, alt: `${p.title} card styled with an envelope and flowers`, width: 1200, height: 1200 },
          { productId: product.id, key: open.key, role: "INSIDE", sortOrder: 2, alt: `${p.title} — example of a personalised inside message`, width: 1200, height: 1200 },
        ],
      });
    } else {
      const portraitA4 = p.art.card ? false : true;
      const png = await designPng(p.art.design, 2480);
      const frontImg = await storePublicImage(png, folder);
      const mock = await storePublicImage(
        await render(portraitA4 ? a4Mockup(await designPng(p.art.design, 900), p.art.tone, sort) : lifestyleMockup(await designPng(p.art.design, 900), p.art.tone, sort)),
        folder,
      );
      await prisma.productImage.createMany({
        data: [
          { productId: product.id, key: frontImg.key, role: "FRONT", sortOrder: 0, alt: `${p.title} — full design preview`, width: frontImg.width, height: frontImg.height },
          { productId: product.id, key: mock.key, role: "LIFESTYLE", sortOrder: 1, alt: `${p.title} printed and styled`, width: 1200, height: 1200 },
        ],
      });
      const pdf = await demoPdfFromImage(png, portraitA4 ? [595.28, 841.89] : [419.53, 595.28]);
      const key = `private/${folder}/sample-${p.slug}.pdf`;
      await storage().put(key, pdf, "application/pdf");
      await prisma.downloadFile.create({
        data: { productId: product.id, key, filename: `Cardly-${p.title.replace(/[^A-Za-z0-9]+/g, "-").replace(/-+$/, "")}.pdf`, contentType: "application/pdf", sizeBytes: pdf.length },
      });
    }
    console.log(`  ✓ ${p.title}`);
  }
}

async function seedDiscount() {
  await prisma.discountCode.upsert({
    where: { code: "WELCOME10" },
    create: { code: "WELCOME10", description: "Sample code (inactive) — edit or delete in the admin dashboard.", type: "PERCENT", value: 10, active: false },
    update: {},
  });
}

async function main() {
  if (reset) {
    console.log("Resetting catalogue…");
    await prisma.cartItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  }
  await seedAdmin();
  await seedSettings();
  await seedCategories();
  await seedProducts();
  await seedDiscount();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
