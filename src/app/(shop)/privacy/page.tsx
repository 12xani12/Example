import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("privacy", "/privacy");

export default function Page() {
  return <ContentPageView slug="privacy" eyebrow="Legal" />;
}
