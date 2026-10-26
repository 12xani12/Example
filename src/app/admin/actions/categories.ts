"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { CategoryGroup } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deletePublicImage, storePublicImage } from "@/lib/images";
import { getHomepageSettings, saveSetting } from "@/lib/settings";

const MAX_BYTES = 20 * 1024 * 1024;
const GROUPS: CategoryGroup[] = ["GREETING_CARDS", "VIRTUAL_CARDS", "OTHER_DOWNLOADS"];

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

function fail(id: string | null, msg: string): never {
  redirect(`${id ? `/admin/categories/${id}` : "/admin/categories"}?error=${encodeURIComponent(msg)}`);
}

function upload(form: FormData) {
  const file = form.get("image");
  return file instanceof File && file.size > 0 ? file : null;
}

/** Keeps the homepage seasonal collection pointing at the right category. */
async function updateSeasonalSlug(oldSlug: string, newSlug: string) {
  const home = await getHomepageSettings();
  if (home.seasonalCategorySlug === oldSlug) await saveSetting("homepage", { ...home, seasonalCategorySlug: newSlug });
}

export async function saveCategory(form: FormData) {
  await assertAdmin();
  const id = str(form, "id") || null;
  const existing = id ? await prisma.category.findUnique({ where: { id } }) : null;
  if (id && !existing) fail(null, "That category no longer exists.");

  const name = str(form, "name").slice(0, 80);
  if (!name) fail(id, "Please enter a category name.");
  const slug = slugify(str(form, "slug") || name);
  if (!slug) fail(id, "Please enter a slug using letters or numbers.");
  const clash = await prisma.category.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) fail(id, `The slug “${slug}” is already used by ${clash.name}.`);
  const group = str(form, "group") as CategoryGroup;
  if (!GROUPS.includes(group)) fail(id, "Please choose a group.");

  const file = upload(form);
  if (file && file.size > MAX_BYTES) fail(id, "Tile images must be under 20 MB.");
  let imageKey: string | undefined;
  if (file) {
    let stored: { key: string } | null = null;
    try {
      stored = await storePublicImage(Buffer.from(await file.arrayBuffer()), "categories");
    } catch {
      stored = null;
    }
    if (!stored) fail(id, `${file.name} isn't a supported image (use JPG, PNG or WebP).`);
    imageKey = stored.key;
  }
  const bannerFile = form.get("banner");
  let bannerKey: string | undefined;
  if (bannerFile instanceof File && bannerFile.size > 0) {
    if (bannerFile.size > MAX_BYTES) fail(id, "Banner images must be under 20 MB.");
    let stored: { key: string } | null = null;
    try {
      stored = await storePublicImage(Buffer.from(await bannerFile.arrayBuffer()), "categories");
    } catch {
      stored = null;
    }
    if (!stored) fail(id, `${bannerFile.name} isn't a supported image (use JPG, PNG or WebP).`);
    bannerKey = stored.key;
  }

  const data = {
    name,
    slug,
    group,
    description: str(form, "description").slice(0, 1000) || null,
    isHidden: form.get("isHidden") === "on",
    showOnHome: form.get("showOnHome") === "on",
    ...(imageKey ? { imageKey } : {}),
    ...(bannerKey ? { bannerKey } : {}),
  };

  let savedId: string;
  if (existing) {
    // Moving to another group puts the category at the end of that group.
    const sortOrder = existing.group === group ? existing.sortOrder : await nextSortOrder(group);
    await prisma.category.update({ where: { id: existing.id }, data: { ...data, sortOrder } });
    if (imageKey && existing.imageKey) await deletePublicImage(existing.imageKey).catch(() => undefined);
    if (bannerKey && existing.bannerKey) await deletePublicImage(existing.bannerKey).catch(() => undefined);
    if (existing.slug !== slug) await updateSeasonalSlug(existing.slug, slug);
    savedId = existing.id;
  } else {
    const created = await prisma.category.create({ data: { ...data, sortOrder: await nextSortOrder(group) } });
    savedId = created.id;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/categories/${savedId}?saved=1`);
}

async function nextSortOrder(group: CategoryGroup) {
  const last = await prisma.category.findFirst({ where: { group }, orderBy: { sortOrder: "desc" } });
  return (last?.sortOrder ?? -1) + 1;
}

export async function moveCategory(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const direction = str(form, "direction") === "up" ? -1 : 1;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) redirect(`/admin/categories?error=${encodeURIComponent("That category no longer exists.")}`);
  // Renumber the whole group so ties in sortOrder can't stop a swap.
  const siblings = await prisma.category.findMany({ where: { group: category.group }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const from = siblings.findIndex((c) => c.id === id);
  const to = from + direction;
  if (to >= 0 && to < siblings.length) {
    [siblings[from], siblings[to]] = [siblings[to], siblings[from]];
    await prisma.$transaction(
      siblings.flatMap((c, i) => (c.sortOrder === i ? [] : [prisma.category.update({ where: { id: c.id }, data: { sortOrder: i } })])),
    );
  }
  revalidatePath("/", "layout");
  redirect(`/admin/categories?saved=1#cat-${id}`);
}

export async function deleteCategory(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) redirect(`/admin/categories?error=${encodeURIComponent("That category no longer exists.")}`);
  if (str(form, "confirm") !== category.name) fail(id, `Type the category name (${category.name}) exactly to confirm.`);
  // Products stay; only their links to this category (ProductCategory) are removed.
  await prisma.category.delete({ where: { id } });
  if (category.imageKey) await deletePublicImage(category.imageKey).catch(() => undefined);
  if (category.bannerKey) await deletePublicImage(category.bannerKey).catch(() => undefined);
  await updateSeasonalSlug(category.slug, "");
  revalidatePath("/", "layout");
  redirect("/admin/categories?deleted=1");
}
