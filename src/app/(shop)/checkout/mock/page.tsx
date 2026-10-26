import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { mockPaymentsEnabled } from "@/lib/env";
import { hmac, safeEqual } from "@/lib/crypto";
import { formatAud } from "@/lib/money";
import { simulatePayment } from "@/app/actions/checkout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Simulated payment", robots: { index: false } };

export default async function MockPaymentPage({ searchParams }: { searchParams: Promise<{ order?: string; sig?: string }> }) {
  if (!mockPaymentsEnabled()) notFound();
  const { order: orderId = "", sig = "" } = await searchParams;
  if (!safeEqual(sig, hmac(`mock:${orderId}`))) notFound();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) notFound();
  return (
    <div className="container-page max-w-lg py-16">
      <div className="rounded-3xl border-2 border-dashed border-rose/50 bg-white p-8 text-center shadow-soft">
        <p className="eyebrow">Development only</p>
        <h1 className="mt-2 text-4xl">Simulated payment</h1>
        <p className="mt-3 text-charcoal-soft">
          Stripe keys aren&apos;t configured, so this page stands in for the hosted payment page. It never appears in production.
        </p>
        <p className="mt-6 text-2xl">{order.number} · {formatAud(order.totalCents)}</p>
        <form action={simulatePayment} className="mt-8 flex flex-col gap-3">
          <input type="hidden" name="order" value={order.id} />
          <input type="hidden" name="sig" value={sig} />
          <button name="outcome" value="pay" className="btn-primary">Simulate successful payment</button>
          <button name="outcome" value="fail" className="btn-secondary">Simulate failed payment</button>
        </form>
      </div>
    </div>
  );
}
