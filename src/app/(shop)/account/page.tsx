import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { signedDownloadUrl } from "@/lib/order-access";
import { formatAudShort } from "@/lib/money";
import { summarise, type Personalisation } from "@/lib/card/personalisation";
import { logout } from "@/app/actions/account";
import { ProfileForm } from "./AuthForms";
import { DownloadIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false } };

const STATUS: Record<string, string> = { PENDING: "Awaiting payment", PAID: "Paid", FAILED: "Payment failed", CANCELLED: "Cancelled", REFUNDED: "Refunded", PARTIALLY_REFUNDED: "Partially refunded" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const user = await requireUser("/account");
  const sp = await searchParams;
  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { entitlements: { where: { revokedAt: null } } } } },
  });
  const library = orders
    .filter((o) => (o.status === "PAID" || o.status === "PARTIALLY_REFUNDED") && o.fulfilmentStatus === "FULFILLED")
    .flatMap((o) => o.items.map((i) => ({ order: o, item: i })));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-2 text-5xl">Hello{user.name ? `, ${user.name}` : ""}</h1>
          <p className="mt-1 text-charcoal-soft">{user.email}</p>
        </div>
        <form action={logout}><button type="submit" className="btn-secondary btn-sm">Sign out</button></form>
      </div>
      {sp.reset && <p role="status" className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm">Your password has been updated.</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section aria-labelledby="library">
            <h2 id="library" className="text-3xl">Download library</h2>
            {library.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-white p-6 text-charcoal-soft shadow-soft">
                Purchases you make while signed in will appear here. Bought something as a guest? Open the order from your email link and choose “Save to my account”.
              </p>
            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {library.map(({ order, item }) => (
                  <li key={item.id} className="rounded-2xl bg-white p-5 shadow-soft">
                    <p className="font-serif text-xl">{item.title}</p>
                    <p className="text-xs text-charcoal-muted">{item.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"} · {order.number}</p>
                    {item.personalisation && <p className="mt-2 text-sm text-charcoal-soft">{summarise(item.personalisation as Personalisation)}</p>}
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {item.entitlements.map((e) => (
                        <li key={e.id}><a href={signedDownloadUrl(e.id)} className="btn-soft btn-sm" download><DownloadIcon size={14} /> {e.label}</a></li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="history">
            <h2 id="history" className="text-3xl">Purchase history</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-charcoal-soft">No orders yet. <Link href="/shop" className="link">Browse the shop</Link></p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-soft">
                <table className="w-full text-left text-[15px]">
                  <thead className="text-xs uppercase tracking-wider text-charcoal-muted"><tr><th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Total</th></tr></thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-charcoal/5">
                        <td className="p-4"><Link href={`/orders/${o.id}`} className="link">{o.number}</Link></td>
                        <td className="p-4">{o.createdAt.toLocaleDateString("en-AU")}</td>
                        <td className="p-4">{STATUS[o.status]}</td>
                        <td className="p-4 text-right">{formatAudShort(o.totalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
        <aside aria-labelledby="details" className="h-fit rounded-3xl bg-white p-6 shadow-soft">
          <h2 id="details" className="text-2xl">Account details</h2>
          <div className="mt-4"><ProfileForm name={user.name ?? ""} /></div>
        </aside>
      </div>
    </div>
  );
}
