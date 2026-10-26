// Integration tests: run against the database in .env (seeded with `npm run db:seed`).
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Must run before the app modules (which read env at import time) are loaded.
vi.hoisted(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_cardly_dummy";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_cardly_test_secret";
});
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { hmac } from "@/lib/crypto";
import { defaultPersonalisation } from "@/lib/card/personalisation";

const stripe = new Stripe("sk_test_cardly_dummy");
const created: string[] = [];
let productId = "";
let variantId = "";

async function makeOrder(totalCents = 400) {
  const product = await prisma.product.findUniqueOrThrow({ where: { slug: "happy-birthday-blooms" }, include: { variants: true, template: true } });
  productId = product.id;
  const variant = product.variants.find((v) => v.kind === "PERSONALISED")!;
  variantId = variant.id;
  const order = await prisma.order.create({
    data: {
      number: `TEST-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      email: "test-buyer@example.com",
      subtotalCents: totalCents,
      totalCents,
      gstMode: "NOT_REGISTERED",
      businessName: "Cardly",
      items: {
        create: [{
          productId, variantId, title: product.title, variantKind: "PERSONALISED", productType: product.type, format: product.format, unitPriceCents: totalCents,
          personalisation: { ...defaultPersonalisation(product.template!), recipient: "Zoë", message: "Happy birthday!\n\nLove the café crew" },
        }],
      },
    },
  });
  created.push(order.id);
  return order;
}

function sessionEvent(id: string, orderId: string, amount: number, type = "checkout.session.completed") {
  return {
    id,
    object: "event",
    type,
    data: { object: { id: `cs_test_${orderId}`, object: "checkout.session", payment_status: "paid", amount_total: amount, currency: "aud", metadata: { orderId }, client_reference_id: orderId, payment_intent: `pi_test_${orderId}` } },
  };
}

async function postWebhook(body: object, secret = "whsec_cardly_test_secret") {
  const payload = JSON.stringify(body);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  const { POST } = await import("@/app/api/webhooks/stripe/route");
  return POST(new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": header } }));
}

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.processedWebhookEvent.deleteMany({ where: { id: { startsWith: "evt_test_" } } });
  await prisma.order.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
});

describe("Stripe webhook", () => {
  it("rejects requests with an invalid signature", async () => {
    const order = await makeOrder();
    const res = await postWebhook(sessionEvent("evt_test_bad", order.id, 400), "whsec_wrong");
    expect(res.status).toBe(400);
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("PENDING");
  });

  it("marks the order paid, generates files once, and ignores duplicate deliveries", async () => {
    const order = await makeOrder();
    const event = sessionEvent(`evt_test_${order.id}`, order.id, 400);
    const first = await postWebhook(event);
    expect(first.status).toBe(200);
    const dup = await postWebhook(event);
    expect(await dup.json()).toMatchObject({ duplicate: true });
    // A different event for the same session (e.g. async_payment_succeeded) must not double-process either.
    await postWebhook({ ...event, id: `evt_test_${order.id}_2`, type: "checkout.session.async_payment_succeeded" });

    const paid = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, entitlements: true } });
    expect(paid.status).toBe("PAID");
    expect(paid.fulfilmentStatus).toBe("FULFILLED");
    expect(paid.payments).toHaveLength(1);
    expect(paid.entitlements).toHaveLength(1);
    expect(paid.entitlements[0].filename).toBe("Cardly-Happy-Birthday-Blooms-Personalised.pdf");
  });

  it("does not mark an order paid when the amount doesn't match", async () => {
    const order = await makeOrder(400);
    await postWebhook(sessionEvent(`evt_test_${order.id}`, order.id, 100));
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("PENDING");
  });

  it("syncs refunds from charge.refunded", async () => {
    const order = await makeOrder();
    await postWebhook(sessionEvent(`evt_test_${order.id}`, order.id, 400));
    await postWebhook({ id: `evt_test_refund_${order.id}`, object: "event", type: "charge.refunded", data: { object: { object: "charge", payment_intent: `pi_test_${order.id}`, amount_refunded: 400 } } });
    const refunded = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(refunded.status).toBe("REFUNDED");
    expect(refunded.refundedCents).toBe(400);
  });

  it("marks expired checkouts as cancelled", async () => {
    const order = await makeOrder();
    await postWebhook({ ...sessionEvent(`evt_test_exp_${order.id}`, order.id, 400, "checkout.session.expired") });
    expect((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("CANCELLED");
  });
});

describe("secure downloads", () => {
  async function paidEntitlement() {
    const order = await makeOrder();
    await postWebhook(sessionEvent(`evt_test_${order.id}`, order.id, 400));
    return prisma.downloadEntitlement.findFirstOrThrow({ where: { orderId: order.id } });
  }
  async function get(id: string, exp: number | string, sig: string) {
    const { GET } = await import("@/app/api/downloads/[id]/route");
    return GET(new Request(`http://localhost/api/downloads/${id}?exp=${exp}&sig=${sig}`), { params: Promise.resolve({ id }) });
  }
  const sign = (id: string, exp: number) => hmac(`dl:${id}:${exp}`);

  it("serves the file for a valid, unexpired signature", async () => {
    const ent = await paidEntitlement();
    const exp = Math.floor(Date.now() / 1000) + 60;
    const res = await get(ent.id, exp, sign(ent.id, exp));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("Cardly-Happy-Birthday-Blooms-Personalised.pdf");
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("rejects expired and tampered links", async () => {
    const ent = await paidEntitlement();
    const past = Math.floor(Date.now() / 1000) - 1;
    expect((await get(ent.id, past, sign(ent.id, past))).status).toBe(403);
    const exp = Math.floor(Date.now() / 1000) + 60;
    expect((await get(ent.id, exp + 1000, sign(ent.id, exp))).status).toBe(403);
    const other = await paidEntitlement();
    expect((await get(other.id, exp, sign(ent.id, exp))).status).toBe(403);
  });

  it("enforces the optional download limit", async () => {
    const ent = await paidEntitlement();
    await prisma.downloadEntitlement.update({ where: { id: ent.id }, data: { maxDownloads: 1 } });
    const exp = Math.floor(Date.now() / 1000) + 60;
    expect((await get(ent.id, exp, sign(ent.id, exp))).status).toBe(200);
    expect((await get(ent.id, exp, sign(ent.id, exp))).status).toBe(429);
  });

  it("blocks downloads for refunded orders", async () => {
    const ent = await paidEntitlement();
    await prisma.order.update({ where: { id: ent.orderId }, data: { status: "REFUNDED" } });
    const exp = Math.floor(Date.now() / 1000) + 60;
    expect((await get(ent.id, exp, sign(ent.id, exp))).status).toBe(403);
  });
});

describe("guest order links", () => {
  it("accept valid tokens and report expired ones", async () => {
    const { verifyAccessToken, issueAccessToken } = await import("@/lib/order-access");
    const token = await issueAccessToken("order123");
    expect(verifyAccessToken("order123", token)).toBe("valid");
    expect(verifyAccessToken("another-order", token)).toBe("invalid");
    const past = Math.floor(Date.now() / 1000) - 10;
    expect(verifyAccessToken("order123", `${past}.${hmac(`order:order123:${past}`)}`)).toBe("expired");
  });
});
