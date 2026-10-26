import type { Metadata } from "next";
import { ForgotForm } from "../AuthForms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <div className="container-page max-w-md py-14">
      <h1 className="text-center text-5xl">Forgot your password?</h1>
      <p className="mt-2 text-center text-charcoal-soft">Enter your email and we&apos;ll send you a secure link to choose a new one.</p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft sm:p-8"><ForgotForm /></div>
    </div>
  );
}
