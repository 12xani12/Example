import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/stripe-events";

export async function POST(req: Request) {
  if (!env.stripeWebhookSecret || !env.stripeSecretKey) return new Response("Webhooks not configured", { status: 503 });
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature ?? "", env.stripeWebhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (await prisma.processedWebhookEvent.findUnique({ where: { id: event.id } })) {
    return Response.json({ received: true, duplicate: true });
  }
  try {
    const outcome = await handleStripeEvent(event);
    await prisma.processedWebhookEvent.create({ data: { id: event.id, type: event.type } }).catch((e) => {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    });
    return Response.json({ received: true, outcome });
  } catch (err) {
    console.error("[stripe webhook] failed", event.type, err);
    // Non-2xx makes Stripe retry later; every handler is idempotent.
    return new Response("Webhook handler failed", { status: 500 });
  }
}
