"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ImageRole, ProductFormat, ProductStatus, ProductType, VariantKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { parseDollarsToCents } from "@/lib/money";
import { storage } from "@/lib/storage";
import { deletePublicImage, storePrivateArtwork, storePublicImage } from "@/lib/images";
import { FONT_KEYS } from "@/lib/card/constants";
import { randomUUID } from "crypto";

const MAX_BYTES = 50 * 1024 * 1024;
const TYPES: ProductType[] = ["GREETING_CARD", "VIRTUAL_CARD", "INVITATION", "PLANNER", "WALL_ART", "GIFT_TAG", "CHECKLIST", "TEMPLATE", "PARTY_DECORATION", "PRINTABLE_GAME", "OTHER"];

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "product";
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await prisma.product.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}

function fail(id: string | null, msg: string): never {
  redirect(`${id ? `/admin/products/${id}` : "/admin/products/new"}?error=${encodeURIComponent(msg)}`);
}

export async function saveProduct(form: FormData) {
  await assertAdmin();
  const id = str(form, "id") || null;
  const title = str(form, "title");
  if (!title) fail(id, "Please enter a product title.");
  const type = str(form, "type") as ProductType;
  if (!TYPES.includes(type)) fail(id, "Please choose a product type.");
  const format: ProductFormat = type === "VIRTUAL_CARD" ? "VIRTUAL" : (str(form, "format") as ProductFormat) === "VIRTUAL" ? "VIRTUAL" : "PRINTABLE";
  const status = (["DRAFT", "PUBLISHED", "ARCHIVED"].includes(str(form, "status")) ? str(form, "status") : "DRAFT") as ProductStatus;

  const readyEnabled = form.get("readyEnabled") === "on";
  const persEnabled = form.get("personalisedEnabled") === "on";
  const readyPrice = parseDollarsToCents(str(form, "readyPrice") || "0");
  const persPrice = parseDollarsToCents(str(form, "personalisedPrice") || "0");
  if (readyEnabled && (readyPrice === null || readyPrice < 50)) fail(id, "Ready-made price must be at least $0.50.");
  if (persEnabled && (persPrice === null || persPrice < 50)) fail(id, "Personalised price must be at least $0.50.");
  if (!readyEnabled && !persEnabled) fail(id, "Enable at least one purchase option.");

  const slug = await uniqueSlug(str(form, "slug") || title, id ?? undefined);
  const data = {
    title,
    slug,
    type,
    format,
    status,
    shortDescription: str(form, "shortDescription"),
    description: str(form, "description"),
    whatsIncluded: str(form, "whatsIncluded"),
    sizeInfo: str(form, "sizeInfo"),
    tags: str(form, "tags").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 30),
    isFeatured: form.get("isFeatured") === "on",
    isNewArrival: form.get("isNewArrival") === "on",
    isDemo: form.get("isDemo") === "on",
    sortOrder: Number(str(form, "sortOrder")) || 0,
    seoTitle: str(form, "seoTitle") || null,
    seoDescription: str(form, "seoDescription") || null,
  };
  const categoryIds = form.getAll("categories").map(String);

  const product = id ? await prisma.product.update({ where: { id }, data }) : await prisma.product.create({ data });
  await prisma.productCategory.deleteMany({ where: { productId: product.id } });
  if (categoryIds.length) await prisma.productCategory.createMany({ data: categoryIds.map((categoryId) => ({ productId: product.id, categoryId })), skipDuplicates: true });

  for (const [kind, enabled, price] of [["READY_MADE", readyEnabled, readyPrice], ["PERSONALISED", persEnabled, persPrice]] as const) {
    await prisma.productVariant.upsert({
      where: { productId_kind: { productId: product.id, kind } },
      create: { productId: product.id, kind, priceCents: price ?? 0, active: enabled },
      update: { active: enabled, ...(enabled && price !== null ? { priceCents: price } : {}) },
    });
  }
  if (persEnabled || type === "GREETING_CARD" || type === "VIRTUAL_CARD") {
    await prisma.cardTemplate.upsert({ where: { productId: product.id }, create: { productId: product.id, personalisable: persEnabled }, update: { personalisable: persEnabled } });
  }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function setProductStatus(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const status = str(form, "status") as ProductStatus;
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProduct(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  if (form.get("confirm") !== "DELETE") redirect(`/admin/products/${id}?error=${encodeURIComponent("Type DELETE to confirm.")}`);
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, files: true, template: true } });
  if (product) {
    await prisma.product.delete({ where: { id } });
    // Order downloads are copies under private/orders, so customers keep access.
    await Promise.allSettled([
      ...product.images.map((i) => deletePublicImage(i.key)),
      ...product.files.map((f) => storage().delete(f.key)),
      ...[product.template?.frontArtKey, product.template?.insideArtKey, product.template?.backArtKey].filter(Boolean).map((k) => storage().delete(k!)),
    ]);
  }
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}

function files(form: FormData, key: string) {
  return form.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);
}

export async function uploadImages(form: FormData) {
  await assertAdmin();
  const productId = str(form, "productId");
  const role = (str(form, "role") || "OTHER") as ImageRole;
  const count = await prisma.productImage.count({ where: { productId } });
  let i = 0;
  for (const file of files(form, "images")) {
    if (file.size > MAX_BYTES) redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name} is larger than 50 MB.`)}`);
    try {
      const img = await storePublicImage(Buffer.from(await file.arrayBuffer()), `products/${productId}`);
      await prisma.productImage.create({ data: { productId, key: img.key, width: img.width, height: img.height, role, alt: str(form, "alt"), sortOrder: count + i++ } });
    } catch {
      redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name} isn't a supported image (use JPG, PNG or WebP).`)}`);
    }
  }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#images`);
}

export async function updateImage(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const img = await prisma.productImage.findUniqueOrThrow({ where: { id } });
  if (form.get("delete") === "1") {
    await prisma.productImage.delete({ where: { id } });
    await deletePublicImage(img.key).catch(() => undefined);
  } else {
    await prisma.productImage.update({ where: { id }, data: { alt: str(form, "alt"), role: str(form, "role") as ImageRole, sortOrder: Number(str(form, "sortOrder")) || 0 } });
  }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${img.productId}?saved=1#images`);
}

const FILE_TYPES: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", zip: "application/zip" };

export async function uploadDownloadFiles(form: FormData) {
  await assertAdmin();
  const productId = str(form, "productId");
  const kind = str(form, "variantKind");
  const variantKind = kind === "READY_MADE" || kind === "PERSONALISED" ? (kind as VariantKind) : null;
  for (const file of files(form, "files")) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type = FILE_TYPES[ext];
    if (!type) redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name}: please upload PDF, PNG, JPG or ZIP files.`)}`);
    if (file.size > MAX_BYTES) redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name} is larger than 50 MB.`)}`);
    const body = Buffer.from(await file.arrayBuffer());
    if (ext === "pdf" && body.subarray(0, 5).toString() !== "%PDF-") redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name} doesn't look like a valid PDF.`)}`);
    const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+/, "").slice(0, 100) || `file.${ext}`;
    const key = `private/products/${productId}/files/${randomUUID()}-${safeName}`;
    await storage().put(key, body, type);
    await prisma.downloadFile.create({ data: { productId, key, filename: safeName, contentType: type, sizeBytes: body.length, variantKind } });
  }
  redirect(`/admin/products/${productId}?saved=1#files`);
}

export async function deleteDownloadFile(form: FormData) {
  await assertAdmin();
  const file = await prisma.downloadFile.findUniqueOrThrow({ where: { id: str(form, "id") } });
  await prisma.downloadFile.delete({ where: { id: file.id } });
  await storage().delete(file.key).catch(() => undefined);
  redirect(`/admin/products/${file.productId}?saved=1#files`);
}

function num(form: FormData, k: string, min: number, max: number, fallback: number) {
  const n = Number(str(form, k));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
}

export async function saveTemplate(form: FormData) {
  await assertAdmin();
  const productId = str(form, "productId");
  const existing = await prisma.cardTemplate.findUnique({ where: { productId } });
  const allowedFonts = form.getAll("allowedFonts").map(String).filter((f) => (FONT_KEYS as string[]).includes(f));
  const allowedColours = str(form, "allowedColours").split(/[\s,]+/).map((c) => c.toUpperCase()).filter((c) => /^#[0-9A-F]{6}$/.test(c));
  if (!allowedFonts.length) redirect(`/admin/products/${productId}?error=${encodeURIComponent("Choose at least one font.")}#template`);
  if (!allowedColours.length) redirect(`/admin/products/${productId}?error=${encodeURIComponent("Add at least one text colour (e.g. #302C2B).")}#template`);
  const minFontSize = num(form, "minFontSize", 8, 48, 12);
  const maxFontSize = num(form, "maxFontSize", minFontSize, 60, 30);
  const textX = num(form, "textX", 0, 400, 52);
  const textY = num(form, "textY", 0, 580, 120);
  const data = {
    personalisable: form.get("personalisable") === "on",
    textX,
    textY,
    textWidth: num(form, "textWidth", 40, 419.53 - textX, 315),
    textHeight: num(form, "textHeight", 40, 595.28 - textY, 360),
    allowedFonts,
    defaultFont: allowedFonts.includes(str(form, "defaultFont")) ? str(form, "defaultFont") : allowedFonts[0],
    minFontSize,
    maxFontSize,
    defaultFontSize: num(form, "defaultFontSize", minFontSize, maxFontSize, 18),
    allowedColours,
    defaultColour: allowedColours.includes(str(form, "defaultColour").toUpperCase()) ? str(form, "defaultColour").toUpperCase() : allowedColours[0],
    defaultAlign: ["left", "center", "right"].includes(str(form, "defaultAlign")) ? str(form, "defaultAlign") : "center",
    readyMadeMessage: str(form, "readyMadeMessage").slice(0, 600),
  };

  const art: Partial<Record<"frontArtKey" | "insideArtKey" | "backArtKey" | "frontPreviewKey" | "insidePreviewKey", string | null>> = {};
  const folder = `products/${productId}`;
  for (const [field, previewField] of [["frontArt", "frontPreviewKey"], ["insideArt", "insidePreviewKey"], ["backArt", null]] as const) {
    const file = files(form, field)[0];
    if (form.get(`remove_${field}`) === "on") {
      art[`${field}Key` as "frontArtKey"] = null;
      if (previewField) art[previewField] = null;
      continue;
    }
    if (!file) continue;
    if (file.size > MAX_BYTES) redirect(`/admin/products/${productId}?error=${encodeURIComponent("Artwork must be under 50 MB.")}#template`);
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      art[`${field}Key` as "frontArtKey"] = await storePrivateArtwork(buf, folder);
      if (previewField) {
        const preview = await storePublicImage(buf, folder);
        art[previewField] = preview.key;
        if (field === "frontArt" && !(await prisma.productImage.findFirst({ where: { productId, role: "FRONT" } }))) {
          await prisma.productImage.create({ data: { productId, key: preview.key, role: "FRONT", sortOrder: -1, width: preview.width, height: preview.height, alt: "Front cover" } });
        }
      }
    } catch {
      redirect(`/admin/products/${productId}?error=${encodeURIComponent(`${file.name} isn't a supported image. Upload a PNG or JPG (ideally 1748 × 2480 px, 300 dpi A5 portrait).`)}#template`);
    }
  }
  for (const k of ["frontArtKey", "insideArtKey", "backArtKey"] as const) {
    if (k in art && existing?.[k] && existing[k] !== art[k]) await storage().delete(existing[k]!).catch(() => undefined);
  }

  await prisma.cardTemplate.upsert({ where: { productId }, create: { productId, ...data, ...art }, update: { ...data, ...art } });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1#template`);
}
