import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("terms", "/terms");

export default function Page() {
  return <ContentPageView slug="terms" eyebrow="Legal" />;
}
