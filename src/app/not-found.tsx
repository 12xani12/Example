import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blush to-cream px-4 text-center">
      <Link href="/" aria-label="Cardly home"><LogoMark className="text-6xl" /></Link>
      <h1 className="mt-6 text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-charcoal-soft">It may have moved, or the link might be incomplete. Let&apos;s get you back to the cards.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-primary">Shop all cards</Link>
        <Link href="/" className="btn-secondary">Go home</Link>
      </div>
    </main>
  );
}
