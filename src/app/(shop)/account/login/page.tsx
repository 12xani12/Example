import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../AuthForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  return (
    <div className="container-page max-w-md py-14">
      <h1 className="text-center text-5xl">Welcome back</h1>
      <p className="mt-2 text-center text-charcoal-soft">Sign in to see your orders and download library.</p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft sm:p-8"><LoginForm next={next} /></div>
      <p className="mt-6 text-center text-sm text-charcoal-soft">
        New to Cardly? <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="link">Create an account</Link>
        <br />Accounts are optional — you can always check out as a guest.
      </p>
    </div>
  );
}
