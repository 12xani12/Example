import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("faqs", "/faqs");

export default function Page() {
  return <ContentPageView slug="faqs" eyebrow="Help & FAQs" />;
}
