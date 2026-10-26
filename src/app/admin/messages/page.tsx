import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Badge, Notice } from "../ui";
import { deleteMessage, toggleMessageHandled } from "../actions/messages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesAdmin({ searchParams }: { searchParams: Promise<{ filter?: string; saved?: string; deleted?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const open = sp.filter === "open";
  const [messages, openCount] = await Promise.all([
    prisma.contactMessage.findMany({ where: open ? { handled: false } : {}, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);
  const numbers = [...new Set(messages.map((m) => m.orderNumber?.trim()).filter((n): n is string => !!n))];
  const orders = numbers.length ? await prisma.order.findMany({ where: { number: { in: numbers } }, select: { id: true, number: true } }) : [];
  const orderIds = new Map(orders.map((o) => [o.number, o.id]));
  const tab = (active: boolean) => `rounded-full px-4 py-1.5 text-sm ${active ? "bg-blush font-medium" : "bg-white hover:bg-cream"}`;

  return (
    <>
      <AdminHeader title="Messages" intro="Messages sent through the contact form, newest first. Reply from your own email. Each message is also sent to your support email address when email sending is set up." />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.deleted && <Notice>Message deleted.</Notice>}
      <nav aria-label="Filter messages" className="mb-5 flex gap-2">
        <Link href="/admin/messages" aria-current={!open ? "page" : undefined} className={tab(!open)}>All</Link>
        <Link href="/admin/messages?filter=open" aria-current={open ? "page" : undefined} className={tab(open)}>Needs reply ({openCount})</Link>
      </nav>

      {messages.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-charcoal-muted shadow-soft">{open ? "All caught up — no messages need a reply." : "No messages yet."}</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => {
            const orderId = m.orderNumber ? orderIds.get(m.orderNumber.trim()) : undefined;
            return (
              <li key={m.id} className={`rounded-2xl bg-white p-5 shadow-soft ${m.handled ? "opacity-75" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl">{m.subject}</h2>
                    <p className="mt-1 break-words text-sm text-charcoal-soft">
                      {m.name} · <a href={`mailto:${m.email.replace(/[?#&%]/g, encodeURIComponent)}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="link">{m.email}</a>
                      {m.orderNumber && <> · Order {orderId ? <Link href={`/admin/orders/${orderId}`} className="link">{m.orderNumber}</Link> : <span>{m.orderNumber} <span className="text-charcoal-muted">(not found)</span></span>}</>}
                    </p>
                    <p className="text-xs text-charcoal-muted">{m.createdAt.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <Badge tone={m.handled ? "good" : "warn"}>{m.handled ? "handled" : "needs reply"}</Badge>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-[15px]">{m.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={toggleMessageHandled}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="filter" value={open ? "open" : ""} />
                    <button className="btn-secondary btn-sm">{m.handled ? "Mark as needing reply" : "Mark as handled"}</button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="filter" value={open ? "open" : ""} />
                    <button className="btn-sm rounded-full px-3 text-rose-deeper hover:bg-blush">Delete</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {messages.length === 200 && <p className="mt-4 text-sm text-charcoal-muted">Showing the 200 most recent messages.</p>}
    </>
  );
}
