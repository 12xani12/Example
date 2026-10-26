"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions/contact";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null);
  if (state?.ok) {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-soft">
        <p className="font-script text-5xl text-rose">Thank you</p>
        <h2 className="mt-2 text-3xl">Your message has been sent</h2>
        <p className="mt-2 text-charcoal-soft">We&apos;ll reply to you by email as soon as we can.</p>
      </div>
    );
  }
  const err = state?.fieldErrors ?? {};
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, optional = false) => (
    <div>
      <label htmlFor={name} className="label">{label}{optional && <span className="font-normal text-charcoal-muted"> (optional)</span>}</label>
      <input id={name} name={name} className="input" aria-invalid={!!err[name]} aria-describedby={err[name] ? `${name}-err` : undefined} {...props} />
      {err[name] && <p id={`${name}-err`} className="mt-1 text-sm text-rose-deeper">{err[name]}</p>}
    </div>
  );
  return (
    <form action={action} className="space-y-5 rounded-3xl bg-white p-6 shadow-soft sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", required: true })}
        {field("email", "Email", { type: "email", autoComplete: "email", inputMode: "email", required: true })}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("orderNumber", "Order number", { placeholder: "e.g. CDL-ABC1234" }, true)}
        {field("subject", "Subject", { required: true })}
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={6} className="input" required aria-invalid={!!err.message} aria-describedby={err.message ? "message-err" : undefined} />
        {err.message && <p id="message-err" className="mt-1 text-sm text-rose-deeper">{err.message}</p>}
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {state?.error && <p role="alert" className="text-sm text-rose-deeper">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
