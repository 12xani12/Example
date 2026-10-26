import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("how-it-works", "/how-it-works");

export default function Page() {
  return <ContentPageView slug="how-it-works" eyebrow="How it works" />;
}
