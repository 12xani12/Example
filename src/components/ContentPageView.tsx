import type { Metadata } from "next";
import Link from "next/link";
import { getContentPage } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";
import type { PageSlug } from "@/content/pages";
import { Markdown } from "./Markdown";
import { PageIntro } from "./Catalog";

export async function contentMetadata(slug: PageSlug, path: string): Promise<Metadata> {
  const page = await getContentPage(slug);
  return { title: page.title, description: page.description, alternates: { canonical: path } };
}

export async function ContentPageView({ slug, eyebrow, children }: { slug: PageSlug; eyebrow?: string; children?: React.ReactNode }) {
  const [page, user] = await Promise.all([getContentPage(slug), getCurrentUser()]);
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={page.title} />
      <div className="container-page max-w-3xl py-12 sm:py-16">
        {page.draft && user?.role === "ADMIN" && (
          <p className="mb-8 rounded-2xl bg-peach px-5 py-3 text-sm">
            Admin note: this page is marked as a draft. Review it, then edit or mark it final in{" "}
            <Link href={`/admin/pages/${slug}`} className="link">the admin dashboard</Link>.
          </p>
        )}
        <Markdown source={page.body} />
        {children}
      </div>
    </>
  );
}
