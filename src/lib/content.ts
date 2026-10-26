import "server-only";
import { prisma } from "./db";
import { DEFAULT_PAGES, type PageSlug } from "@/content/pages";

export type ContentPage = { title: string; description: string; body: string; draft: boolean };

export const PAGE_SLUGS = Object.keys(DEFAULT_PAGES) as PageSlug[];

/** Admin edits are stored as settings ("page:<slug>") and override the built-in drafts. */
export async function getContentPage(slug: PageSlug): Promise<ContentPage> {
  const row = await prisma.setting.findUnique({ where: { key: `page:${slug}` } });
  return { ...DEFAULT_PAGES[slug], ...((row?.value as Partial<ContentPage>) ?? {}) };
}

export async function saveContentPage(slug: PageSlug, page: ContentPage) {
  await prisma.setting.upsert({ where: { key: `page:${slug}` }, create: { key: `page:${slug}`, value: page }, update: { value: page } });
}
