import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/Catalog";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about a download, personalisation or your order? Send the Cardly team a message and we'll get back to you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="We're here to help" title="Contact Cardly" intro="Questions about a design, your download or personalising a card? Send us a message and we'll reply by email." />
      <div className="container-page grid max-w-5xl gap-10 py-12 lg:grid-cols-[1fr_300px]">
        <ContactForm />
        <aside className="space-y-4 text-[15px]">
          <div className="rounded-3xl bg-sage p-6">
            <h2 className="text-2xl">Lost your download?</h2>
            <p className="mt-2 text-charcoal-soft">You can get a fresh link instantly — no need to wait for a reply.</p>
            <Link href="/orders/lookup" className="link mt-2 inline-block">Find my downloads</Link>
          </div>
          <div className="rounded-3xl bg-blush p-6">
            <h2 className="text-2xl">Quick answers</h2>
            <p className="mt-2 text-charcoal-soft">Printing, paper and personalisation questions are covered in our help pages.</p>
            <p className="mt-2 flex flex-col gap-1">
              <Link href="/faqs" className="link">FAQs</Link>
              <Link href="/printing-instructions" className="link">Printing instructions</Link>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
