"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-script text-6xl text-rose">Oops</p>
      <h1 className="mt-2 text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-charcoal-soft">Sorry about that. Please try again — if it keeps happening, contact us and we&apos;ll help.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/contact" className="btn-secondary">Contact us</Link>
      </div>
    </main>
  );
}
