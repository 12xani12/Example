"use client";

import Link from "next/link";
import { useActionState } from "react";
import { beginCheckout } from "@/app/actions/checkout";
import { LockIcon } from "@/components/Icons";

export function CheckoutForm({ defaultEmail, simulated }: { defaultEmail: string; simulated: boolean }) {
  const [state, action, pending] = useActionState(beginCheckout, null);
  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" defaultValue={defaultEmail} className="input" aria-describedby="email-help" />
        <p id="email-help" className="mt-1 text-xs text-charcoal-muted">Your receipt and secure download link will be sent here.</p>
      </div>
      <label className="flex items-start gap-3 text-[14px] leading-snug text-charcoal-soft">
        <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 shrink-0 accent-rose-deep" />
        <span>
          I understand these are digital products delivered by download (nothing is posted), and I agree to the{" "}
          <Link href="/terms" className="link" target="_blank">Terms &amp; Conditions</Link> and{" "}
          <Link href="/licence" className="link" target="_blank">Personal Use Licence</Link>.
        </span>
      </label>
      {state?.error && <p role="alert" className="rounded-2xl bg-blush-light px-4 py-3 text-sm text-rose-deeper">{state.error}</p>}
      <button type="submit" className="btn-primary w-full py-4" disabled={pending}>
        <LockIcon size={18} /> {pending ? "Preparing secure payment…" : "Continue to secure payment"}
      </button>
      <p className="text-center text-xs text-charcoal-muted">
        {simulated
          ? "Development mode: Stripe isn't configured, so you'll see a simulated payment page. No real payment is taken."
          : "You'll pay on Stripe's secure checkout. Cards, Apple Pay and Google Pay are accepted where available. We never see or store your card details."}
      </p>
    </form>
  );
}
