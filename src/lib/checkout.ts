import "server-only";
import type Stripe from "stripe";
import { randomInt } from "crypto";
import { prisma } from "./db";
import { env, mockPaymentsEnabled } from "./env";
import { getCartView } from "./cart";
import { findDiscount } from "./discounts";
import { getBusinessSettings } from "./settings";
import { getCurrentUser } from "./auth";
import { getStripe } from "./stripe";
import { hmac } from "./crypto";
import { grantOrderInBrowser } from "./order-access";
import { PRODUCT_TYPE_LABELS } from "./labels";
import { productInclude, purchasableVariants } from "./catalog";
import { parsePersonalisation, type Personalisation } from "./card/personalisation";
import { layoutMessage, layoutProblems } from "./card/layout";
import { cardFont } from "./files/fonts";

function orderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 7; i++) s += alphabet[randomInt(alphabet.length)];
  return `CDL-${s}`;
}

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Create a PENDING order from the current cart and start a hosted payment.
 * Prices, discounts and personalisation are re-validated on the server.
 */
export async function startCheckout(emailInput: string): Promise<CheckoutResult> {
  const cart = await getCartView();
  if (!cart.id || cart.lines.length === 0) return { ok: false, error: "Your cart is empty." };
  if (cart.hasUnavailable) return { ok: false, error: "Some items in your cart are no longer available. Please remove them to continue." };

  const business = await getBusinessSettings();
  const user = await getCurrentUser();
  const email = emailInput.trim().toLowerCase();

  // Re-check every line against the live product data.
  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: { include: productInclude }, variant: true } });
  for (const item of items) {
    if (!purchasableVariants(item.product).some((v) => v.id === item.variantId)) {
      return { ok: false, error: `“${item.product.title}” is not available to purchase right now.` };
    }
    if (item.variant.kind === "PERSONALISED") {
      const t = item.product.template!;
      const parsed = parsePersonalisation(item.personalisation, t);
      if (!parsed.ok) return { ok: false, error: `“${item.product.title}”: ${parsed.error}` };
      const problems = layoutProblems(layoutMessage(parsed.value, t, cardFont(parsed.value.font)));
      if (problems.length) return { ok: false, error: `“${item.product.title}”: ${problems[0]}` };
    }
  }

  if (cart.totals.totalCents < 50) {
    return { ok: false, error: "The order total must be at least $0.50 AUD. Please check your discount code." };
  }

  let discountCodeId: string | null = null;
  if (cart.discountCode && cart.totals.discountApplied) {
    const found = await findDiscount(cart.discountCode);
    if (found.ok) discountCodeId = found.discount.id;
  }

  const lineByItem = new Map(cart.lines.map((l) => [l.id, l]));
  const order = await prisma.order.create({
    data: {
      number: orderNumber(),
      email,
      userId: user?.id ?? null,
      subtotalCents: cart.totals.subtotalCents,
      discountCents: cart.totals.discountCents,
      gstCents: cart.totals.gstCents,
      totalCents: cart.totals.totalCents,
      gstMode: business.gstMode,
      businessName: business.businessName,
      abn: business.abn || null,
      discountCodeId,
      discountCodeText: discountCodeId ? cart.discountCode : null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          title: item.product.title,
          variantKind: item.variant.kind,
          productType: item.product.type,
          format: item.product.format,
          unitPriceCents: item.variant.priceCents,
          discountCents: lineByItem.get(item.id)?.discountCents ?? 0,
          personalisation: item.variant.kind === "PERSONALISED" ? (item.personalisation as Personalisation) : undefined,
        })),
      },
    },
    include: { items: true },
  });

  await grantOrderInBrowser(order.id);

  if (mockPaymentsEnabled()) {
    const sig = hmac(`mock:${order.id}`);
    return { ok: true, url: `/checkout/mock?order=${order.id}&sig=${sig}` };
  }
  if (!env.stripeSecretKey) return { ok: false, error: "Payments are not configured yet. Please try again later." };

  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((i) => ({
    quantity: 1,
    price_data: {
      currency: "aud",
      unit_amount: i.unitPriceCents,
      product_data: {
        name: i.title,
        description: `${PRODUCT_TYPE_LABELS[i.productType]} · ${i.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made"} · Digital download`,
      },
    },
  }));
  if (order.gstMode === "EXCLUSIVE" && order.gstCents > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: "aud", unit_amount: order.gstCents, product_data: { name: `GST (${business.gstRatePercent}%)` } } });
  }

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (order.discountCents > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: order.discountCents,
      currency: "aud",
      duration: "once",
      max_redemptions: 1,
      name: `Discount ${order.discountCodeText ?? ""}`.trim().slice(0, 40),
      metadata: { orderId: order.id },
    });
    discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      currency: "aud",
      line_items: lineItems,
      discounts,
      customer_email: email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.number },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.number } },
      success_url: `${env.appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/cart?cancelled=1`,
      locale: "en",
    },
    { idempotencyKey: `checkout-${order.id}` },
  );
  await prisma.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id } });
  if (!session.url) return { ok: false, error: "We couldn't start the payment. Please try again." };
  return { ok: true, url: session.url };
}
