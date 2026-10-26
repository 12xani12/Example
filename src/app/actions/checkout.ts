"use server";

import { redirect } from "next/navigation";
import { startCheckout } from "@/lib/checkout";
import { isValidEmail, normaliseEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hmac, safeEqual } from "@/lib/crypto";
import { mockPaymentsEnabled } from "@/lib/env";
import { markOrderPaid } from "@/lib/fulfilment";
import { rateLimit } from "@/lib/rate-limit";

export async function beginCheckout(_prev: { error?: string } | null, form: FormData) {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  if (!isValidEmail(email)) return { error: "Please enter a valid email address so we can send your downloads." };
  if (form.get("agree") !== "on") return { error: "Please confirm you've read the terms and understand these are digital products." };
  if (!(await rateLimit("checkout", 20, 600))) return { error: "Too many attempts. Please wait a few minutes and try again." };
  let result;
  try {
    result = await startCheckout(email);
  } catch (err) {
    console.error("[checkout] failed to start", err);
    return { error: "We couldn't start the payment just now. Please try again in a moment." };
  }
  if (!result.ok) return { error: result.error };
  redirect(result.url);
}

/** Development-only simulated payment. Disabled whenever Stripe is configured or NODE_ENV=production. */
export async function simulatePayment(form: FormData) {
  if (!mockPaymentsEnabled()) throw new Error("Simulated payments are disabled.");
  const orderId = String(form.get("order"));
  const sig = String(form.get("sig"));
  const outcome = String(form.get("outcome"));
  if (!safeEqual(sig, hmac(`mock:${orderId}`))) throw new Error("Invalid request");
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (outcome === "fail") {
    await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "FAILED" } });
    redirect("/checkout?failed=1");
  }
  await markOrderPaid({ orderId, provider: "mock", providerRef: `mock_${orderId}`, amountCents: order.totalCents, currency: order.currency });
  redirect(`/checkout/success?order=${orderId}`);
}
