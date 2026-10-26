import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("licence", "/licence");

export default function Page() {
  return <ContentPageView slug="licence" eyebrow="Legal" />;
}
