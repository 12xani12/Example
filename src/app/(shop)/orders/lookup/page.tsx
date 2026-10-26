import type { Metadata } from "next";
import Link from "next/link";
import { LookupForm } from "./LookupForm";

export const metadata: Metadata = { title: "Find My Downloads", description: "Lost your download link? Request a fresh, secure link to your Cardly purchases.", alternates: { canonical: "/orders/lookup" } };

export default function LookupPage() {
  return (
    <div className="container-page max-w-xl py-14">
      <p className="eyebrow">Find my downloads</p>
      <h1 className="mt-2 text-5xl">Lost your download link?</h1>
      <p className="mt-3 text-charcoal-soft">No problem. Enter the email address you used at checkout and we&apos;ll send you fresh, secure links to your purchases.</p>
      <div className="mt-8"><LookupForm /></div>
      <p className="mt-6 text-sm text-charcoal-soft">Have an account? <Link href="/account" className="link">Sign in</Link> to see your full download library.</p>
    </div>
  );
}
