import type { Metadata } from "next";
import { ResetForm } from "../AuthForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="container-page max-w-md py-14">
      <h1 className="text-center text-5xl">Choose a new password</h1>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft sm:p-8"><ResetForm token={token} /></div>
    </div>
  );
}
