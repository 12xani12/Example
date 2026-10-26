import "server-only";
import type Stripe from "stripe";
import { prisma } from "./db";
import { markOrderPaid } from "./fulfilment";

/** Apply a verified Stripe event. Every branch is idempotent. */
export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") return "awaiting-payment";
      const orderId = session.metadata?.orderId ?? session.client_reference_id;
      if (!orderId) return "no-order";
      const result = await markOrderPaid({
        orderId,
        provider: "stripe",
        providerRef: session.id,
        amountCents: session.amount_total ?? -1,
        currency: session.currency ?? "",
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      });
      return result.changed ? "paid" : result.reason ?? "already-paid";
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId ?? session.client_reference_id;
      if (!orderId) return "no-order";
      await prisma.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: event.type === "checkout.session.expired" ? "CANCELLED" : "FAILED" },
      });
      return "updated";
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!pi) return "no-payment-intent";
      await applyRefund(pi, charge.amount_refunded);
      return "refund-synced";
    }
    default:
      return "ignored";
  }
}

export async function applyRefund(paymentIntentId: string, amountRefunded: number) {
  const order = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
  if (!order) return null;
  const status = amountRefunded <= 0 ? order.status : amountRefunded >= order.totalCents ? "REFUNDED" : "PARTIALLY_REFUNDED";
  return prisma.order.update({ where: { id: order.id }, data: { refundedCents: amountRefunded, status } });
}
