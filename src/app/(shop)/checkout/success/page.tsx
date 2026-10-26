import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { getCartId } from "@/lib/cart";
import { markOrderPaid } from "@/lib/fulfilment";
import { checkOrderAccess } from "@/lib/order-access";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thank you", robots: { index: false } };

async function clearCart() {
  const cartId = await getCartId(false);
  if (cartId) await prisma.cart.update({ where: { id: cartId }, data: { discountCode: null, items: { deleteMany: {} } } });
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string; order?: string }> }) {
  const sp = await searchParams;
  let orderId: string | null = null;

  if (sp.session_id && env.stripeSecretKey) {
    // Verify directly with Stripe in case the webhook hasn't arrived yet. markOrderPaid is idempotent.
    const session = await getStripe().checkout.sessions.retrieve(sp.session_id);
    orderId = session.metadata?.orderId ?? session.client_reference_id ?? null;
    if (orderId && session.payment_status === "paid") {
      await markOrderPaid({
        orderId,
        provider: "stripe",
        providerRef: session.id,
        amountCents: session.amount_total ?? -1,
        currency: session.currency ?? "",
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      });
    }
  } else if (sp.order) {
    orderId = sp.order;
  }

  const order = orderId ? await prisma.order.findUnique({ where: { id: orderId } }) : null;
  if (order && order.status !== "PENDING" && order.status !== "FAILED") await clearCart();
  if (order && (await checkOrderAccess(order)).ok) redirect(`/orders/${order.id}?new=1`);

  return (
    <div className="container-page max-w-xl py-20 text-center">
      <p className="font-script text-6xl text-rose">Thank you</p>
      <h1 className="mt-2 text-4xl">We&apos;re confirming your payment</h1>
      <p className="mt-4 text-charcoal-soft">
        If your payment was successful, your receipt and secure download link are on their way to your inbox. You can also{" "}
        <Link href="/orders/lookup" className="link">request your download link</Link> at any time.
      </p>
    </div>
  );
}
