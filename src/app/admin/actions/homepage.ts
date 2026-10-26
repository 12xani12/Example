"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { deletePublicImage, storePublicImage } from "@/lib/images";
import { getHomepageSettings, saveSetting, type HomepageSettings } from "@/lib/settings";

const MAX_BYTES = 20 * 1024 * 1024;

function str(form: FormData, k: string, max = 300) {
  return String(form.get(k) ?? "").trim().slice(0, max);
}

function fail(msg: string): never {
  redirect(`/admin/homepage?error=${encodeURIComponent(msg)}`);
}

/** Button links must be a page on this site ("/shop") or a full https:// address. */
function validHref(href: string) {
  return (href.startsWith("/") && !href.startsWith("//")) || /^https:\/\/[^\s]+$/.test(href);
}

/** Stores an uploaded image; on failure removes `orphan` (an image uploaded earlier in this request). */
async function storeUpload(form: FormData, field: string, label: string, orphan: string | null = null): Promise<string | null> {
  const file = form.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    if (orphan) await deletePublicImage(orphan).catch(() => undefined);
    fail(`The ${label} must be under 20 MB.`);
  }
  let key: string | null = null;
  try {
    key = (await storePublicImage(Buffer.from(await file.arrayBuffer()), "site")).key;
  } catch {
    key = null;
  }
  if (!key) {
    if (orphan) await deletePublicImage(orphan).catch(() => undefined);
    fail(`${file.name} isn't a supported image (use JPG, PNG or WebP).`);
  }
  return key;
}

export async function saveHomepage(form: FormData) {
  await assertAdmin();
  const current = await getHomepageSettings();

  const heroButtonHref = str(form, "heroButtonHref") || "/shop";
  const promoButtonHref = str(form, "promoButtonHref") || "/shop";
  if (!validHref(heroButtonHref) || !validHref(promoButtonHref)) fail("Button links must start with / (a page on this site) or https://.");
  const heroHeading = str(form, "heroHeading", 120);
  if (!heroHeading) fail("Please enter a hero heading.");

  const seasonalCategorySlug = str(form, "seasonalCategorySlug", 80);
  if (seasonalCategorySlug && !(await prisma.category.findUnique({ where: { slug: seasonalCategorySlug } }))) fail("Please choose a category for the seasonal collection.");

  const heroUpload = await storeUpload(form, "heroImage", "hero image");
  const promoUpload = await storeUpload(form, "promoImage", "promo image", heroUpload);
  const heroImageKey = heroUpload ?? (form.get("removeHeroImage") === "on" ? null : current.heroImageKey);
  const promoImageKey = promoUpload ?? (form.get("removePromoImage") === "on" ? null : current.promoImageKey);

  const next: HomepageSettings = {
    heroHeading,
    heroText: str(form, "heroText", 500),
    heroButtonLabel: str(form, "heroButtonLabel", 40),
    heroButtonHref,
    heroImageKey,
    announcement: str(form, "announcement", 200),
    featuredHeading: str(form, "featuredHeading", 120),
    moreHeading: str(form, "moreHeading", 120),
    moreText: str(form, "moreText", 500),
    promoHeading: str(form, "promoHeading", 120),
    promoText: str(form, "promoText", 500),
    promoButtonLabel: str(form, "promoButtonLabel", 40),
    promoButtonHref,
    promoImageKey,
    seasonalHeading: str(form, "seasonalHeading", 120),
    seasonalText: str(form, "seasonalText", 500),
    seasonalCategorySlug,
  };
  await saveSetting("homepage", next);

  // Remove images that are no longer used.
  for (const old of [current.heroImageKey, current.promoImageKey]) {
    if (old && old !== heroImageKey && old !== promoImageKey) await deletePublicImage(old).catch(() => undefined);
  }
  revalidatePath("/", "layout");
  redirect("/admin/homepage?saved=1");
}
