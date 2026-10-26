import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("refunds", "/refunds");

export default function Page() {
  return <ContentPageView slug="refunds" eyebrow="Legal" />;
}
