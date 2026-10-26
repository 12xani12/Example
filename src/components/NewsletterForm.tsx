"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeNewsletter, type FormState } from "@/app/actions/newsletter";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, null);
  if (state?.ok) {
    return <p role="status" className="rounded-2xl bg-white/70 px-5 py-4 text-center text-[15px]">{state.message}</p>;
  }
  return (
    <form action={action} className="w-full" noValidate>
      <div className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row"}`}>
        <label htmlFor={compact ? "nl-email-footer" : "nl-email"} className="sr-only">Email address</label>
        <input id={compact ? "nl-email-footer" : "nl-email"} name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Your email address" className="input flex-1" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={pending}>
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2.5 text-left text-[13px] leading-snug text-charcoal-soft">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-rose-deep" />
        <span>
          Yes, email me about new designs, special offers, seasonal releases and discount codes. Unsubscribe any time. See our{" "}
          <Link href="/privacy" className="link">Privacy Policy</Link>.
        </span>
      </label>
      {state && !state.ok && <p role="alert" className="mt-2 text-sm text-rose-deeper">{state.message}</p>}
    </form>
  );
}
