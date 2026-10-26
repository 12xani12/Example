"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { PAGE_SLUGS, saveContentPage } from "@/lib/content";
import type { PageSlug } from "@/content/pages";

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

function pageSlug(form: FormData): PageSlug {
  const slug = str(form, "slug") as PageSlug;
  if (!PAGE_SLUGS.includes(slug)) redirect(`/admin/pages?error=${encodeURIComponent("Unknown page.")}`);
  return slug;
}

export async function savePage(form: FormData) {
  await assertAdmin();
  const slug = pageSlug(form);
  const fail = (msg: string): never => redirect(`/admin/pages/${slug}?error=${encodeURIComponent(msg)}`);
  const title = str(form, "title").slice(0, 120);
  if (!title) fail("Please enter a page title.");
  const body = String(form.get("body") ?? "").replace(/\r\n?/g, "\n").trim();
  if (!body) fail("The page body can't be empty.");
  if (body.length > 100_000) fail("The page body is too long.");
  await saveContentPage(slug, {
    title,
    description: str(form, "description").slice(0, 300),
    body,
    draft: form.get("draft") === "on",
  });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${slug}?saved=1`);
}

export async function resetPage(form: FormData) {
  await assertAdmin();
  const slug = pageSlug(form);
  await prisma.setting.deleteMany({ where: { key: `page:${slug}` } });
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${slug}?reset=1`);
}
