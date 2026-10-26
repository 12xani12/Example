import { ContentPageView, contentMetadata } from "@/components/ContentPageView";

export const dynamic = "force-dynamic";
export const generateMetadata = () => contentMetadata("printing-instructions", "/printing-instructions");

export default function Page() {
  return <ContentPageView slug="printing-instructions" eyebrow="Printing help" />;
}
