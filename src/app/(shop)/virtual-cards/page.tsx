import type { Metadata } from "next";
import { Catalog, PageIntro } from "@/components/Catalog";
import type { ShopQuery } from "@/lib/catalog";
import { PhoneIcon, EditIcon, DownloadIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Virtual Greeting Cards — Digital Cards to Share",
  description: "Personalised digital greeting cards you can download and share by text, WhatsApp, email or social media. Instant download, prices in AUD.",
  alternates: { canonical: "/virtual-cards" },
};

export default async function VirtualCardsPage({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const query = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="Virtual cards"
        title="Cards You Can Send in Seconds"
        intro="Virtual cards are made for sharing, not printing. Personalise your message, download the finished images and send them however you like."
      >
        <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-left text-[15px] sm:grid-cols-3">
          {[
            { Icon: EditIcon, t: "Add your own message" },
            { Icon: DownloadIcon, t: "Download PNG images & a PDF" },
            { Icon: PhoneIcon, t: "Share by text, email or social" },
          ].map(({ Icon, t }) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-soft">
              <Icon className="text-rose-deep" size={22} /> {t}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-xl text-sm text-charcoal-soft">
          Please note: Cardly doesn&apos;t send cards on your behalf. You&apos;ll download your finished card and share it yourself.
        </p>
      </PageIntro>
      <div className="container-page py-12">
        <Catalog basePath="/virtual-cards" query={query} fixed={{ format: "virtual" }} hide={["format", "type"]} />
      </div>
    </>
  );
}
