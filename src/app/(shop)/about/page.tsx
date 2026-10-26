import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("about", "/about");

export default function Page() {
  return <ContentPageView slug="about" eyebrow="About Cardly" />;
}
