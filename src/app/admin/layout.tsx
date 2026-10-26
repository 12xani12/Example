import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { AdminNav } from "./AdminNav";
import { logout } from "@/app/actions/account";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Cardly Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-charcoal/10 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin" className="inline-flex items-baseline gap-2">
            <LogoMark className="text-4xl" />
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">Admin</span>
          </Link>
        </div>
        <AdminNav />
        <div className="hidden border-t border-charcoal/10 px-5 py-4 text-xs text-charcoal-muted lg:block">
          <p className="truncate">{user.email}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/" className="link">View shop</Link>
            <form action={logout}><button className="link">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
