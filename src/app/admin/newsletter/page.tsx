import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Badge, Panel } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter" };

const STATUS = {
  SUBSCRIBED: { label: "Subscribed", tone: "good" },
  PENDING: { label: "Awaiting confirmation", tone: "warn" },
  UNSUBSCRIBED: { label: "Unsubscribed", tone: "neutral" },
} as const;

function fmt(d: Date | null) {
  return d ? d.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default async function NewsletterAdmin() {
  await requireAdmin();
  const [groups, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500, select: { id: true, email: true, status: true, consentAt: true, confirmedAt: true } }),
  ]);
  const count = (s: keyof typeof STATUS) => groups.find((g) => g.status === s)?._count._all ?? 0;
  const total = groups.reduce((n, g) => n + g._count._all, 0);
  return (
    <>
      <AdminHeader
        title="Newsletter"
        intro="People who signed up for emails. Subscribers confirm by clicking a link in a confirmation email (double opt-in), so only confirmed addresses are counted as subscribed."
        actions={<a href="/admin/newsletter/export" className="btn-primary btn-sm" download>Export subscribers (CSV)</a>}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
          <div key={s} className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-charcoal-muted">{STATUS[s].label}</p>
            <p className="mt-2 font-serif text-4xl">{count(s)}</p>
          </div>
        ))}
      </div>
      <Panel className="mb-6">
        <p className="text-sm text-charcoal-soft">
          Cardly doesn&apos;t send campaigns itself. To send a newsletter, export the CSV (confirmed subscribers only, with the date and wording of their consent) and import it into your email marketing tool. Unsubscribes made in that tool aren&apos;t synced back to Cardly, so make sure the tool keeps those people unsubscribed when you import a newer list.
        </p>
      </Panel>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="text-xs uppercase tracking-wider text-charcoal-muted">
            <tr><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Consent given</th><th className="p-3">Confirmed</th></tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-charcoal/5">
                <td className="break-all p-3">{s.email}</td>
                <td className="p-3"><Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label.toLowerCase()}</Badge></td>
                <td className="whitespace-nowrap p-3 text-sm">{fmt(s.consentAt)}</td>
                <td className="whitespace-nowrap p-3 text-sm">{fmt(s.confirmedAt)}</td>
              </tr>
            ))}
            {subscribers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-charcoal-muted">No sign-ups yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {total > subscribers.length && <p className="mt-4 text-sm text-charcoal-muted">Showing the {subscribers.length} most recent of {total} sign-ups. The CSV export includes every confirmed subscriber.</p>}
    </>
  );
}
