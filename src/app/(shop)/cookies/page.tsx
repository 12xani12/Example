import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("cookies", "/cookies");

export default function Page() {
  return <ContentPageView slug="cookies" eyebrow="Legal" />;
}
