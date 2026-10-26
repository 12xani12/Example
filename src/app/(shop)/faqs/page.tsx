import { ContentPageView, contentMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/content";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("faqs", "/faqs");

/** Builds FAQPage structured data from "### Question" blocks in the page body. */
function faqJsonLd(body: string) {
  const items = body.split(/\n(?=### )/).filter((b) => b.startsWith("### ")).map((block) => {
    const [q, ...rest] = block.split("\n");
    const answer = rest.join("\n").split(/\n(?=## )/)[0].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*#]/g, "").trim();
    return { "@type": "Question", name: q.slice(4).trim(), acceptedAnswer: { "@type": "Answer", text: answer } };
  });
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items };
}

export default async function Page() {
  const page = await getContentPage("faqs");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.body)).replace(/</g, "\\u003c") }} />
      <ContentPageView slug="faqs" eyebrow="Help & FAQs" />
    </>
  );
}
