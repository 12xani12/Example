"use client";

import { useActionState } from "react";
import { requestOrderLinks } from "@/app/actions/orders";

export function LookupForm() {
  const [state, action, pending] = useActionState(requestOrderLinks, null);
  if (state?.message) return <p role="status" className="rounded-2xl bg-sage px-5 py-4 text-[15px]">{state.message}</p>;
  return (
    <form action={action} className="space-y-4 rounded-3xl bg-white p-6 shadow-soft">
      <div>
        <label htmlFor="lookup-email" className="label">Email used at checkout</label>
        <input id="lookup-email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-rose-deeper">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Email me my download links"}</button>
    </form>
  );
}
