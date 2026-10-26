"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { applyDiscountCode, removeDiscountCode, removeFromCart } from "@/app/actions/cart";
import { EditIcon, TrashIcon } from "@/components/Icons";

export function CartItemActions({ itemId, editHref }: { itemId: string; editHref: string | null }) {
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-sm">
      {editHref && (
        <Link href={editHref} className="inline-flex items-center gap-1.5 text-rose-deep hover:underline">
          <EditIcon size={16} /> Edit personalisation
        </Link>
      )}
      <button type="button" disabled={pending} onClick={() => start(() => removeFromCart(itemId))} className="inline-flex items-center gap-1.5 text-charcoal-soft hover:text-rose-deeper disabled:opacity-50">
        <TrashIcon size={16} /> {pending ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}

export function DiscountForm({ applied, error }: { applied: string | null; error: string | null }) {
  const [state, action, pending] = useActionState(applyDiscountCode, null);
  const [removing, start] = useTransition();
  if (applied) {
    return (
      <div className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Code <strong className="font-medium">{applied}</strong></span>
          <button type="button" className="text-charcoal-soft underline hover:text-rose-deeper" disabled={removing} onClick={() => start(() => removeDiscountCode())}>Remove</button>
        </div>
        {error && <p role="alert" className="mt-1 text-rose-deeper">{error}</p>}
      </div>
    );
  }
  return (
    <form action={action} className="mt-5">
      <label htmlFor="code" className="label">Discount code</label>
      <div className="flex gap-2">
        <input id="code" name="code" className="input py-2.5 uppercase" autoComplete="off" autoCapitalize="characters" />
        <button type="submit" className="btn-secondary btn-sm" disabled={pending}>{pending ? "…" : "Apply"}</button>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-sm text-rose-deeper">{state.error}</p>}
    </form>
  );
}
