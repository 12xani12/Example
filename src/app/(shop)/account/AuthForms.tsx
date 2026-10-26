"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, requestPasswordReset, resetPassword, updateProfile } from "@/app/actions/account";

function Message({ state }: { state: { error?: string; message?: string } | null }) {
  if (state?.error) return <p role="alert" className="rounded-2xl bg-blush-light px-4 py-3 text-sm text-rose-deeper">{state.error}</p>;
  if (state?.message) return <p role="status" className="rounded-2xl bg-sage px-4 py-3 text-sm">{state.message}</p>;
  return null;
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
      <Message state={state} />
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm"><Link href="/account/forgot" className="link">Forgot your password?</Link></p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div><label htmlFor="name" className="label">Name <span className="font-normal text-charcoal-muted">(optional)</span></label><input id="name" name="name" autoComplete="name" className="input" /></div>
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" aria-describedby="pw-help" />
        <p id="pw-help" className="mt-1 text-xs text-charcoal-muted">At least 10 characters.</p>
      </div>
      <Message state={state} />
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <Message state={state} />
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div><label htmlFor="password" className="label">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className="input" /></div>
      <Message state={state} />
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Save new password"}</button>
    </form>
  );
}

export function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <div><label htmlFor="name" className="label">Name</label><input id="name" name="name" defaultValue={name} autoComplete="name" className="input" /></div>
      <fieldset className="space-y-3">
        <legend className="label">Change password <span className="font-normal text-charcoal-muted">(optional)</span></legend>
        <label htmlFor="currentPassword" className="sr-only">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" placeholder="Current password" autoComplete="current-password" className="input" />
        <label htmlFor="newPassword" className="sr-only">New password</label>
        <input id="newPassword" name="newPassword" type="password" placeholder="New password (10+ characters)" autoComplete="new-password" className="input" />
      </fieldset>
      <Message state={state} />
      <button type="submit" className="btn-secondary" disabled={pending}>{pending ? "Saving…" : "Save details"}</button>
    </form>
  );
}
