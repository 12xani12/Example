import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "../AuthForms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  return (
    <div className="container-page max-w-md py-14">
      <h1 className="text-center text-5xl">Create an account</h1>
      <p className="mt-2 text-center text-charcoal-soft">Keep every purchase in one place with your own download library. Optional — guest checkout always works.</p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft sm:p-8"><RegisterForm next={next} /></div>
      <p className="mt-6 text-center text-sm text-charcoal-soft">Already have an account? <Link href="/account/login" className="link">Sign in</Link></p>
    </div>
  );
}
