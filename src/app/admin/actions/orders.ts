"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { applyRefund } from "@/lib/stripe-events";
import { fulfilOrder, sendDownloadsReady } from "@/lib/fulfilment";

function back(id: string, msg: string, error = false): never {
  redirect(`/admin/orders/${id}?${error ? "error" : "saved"}=${encodeURIComponent(msg)}`);
}

/** Email the customer a fresh secure link to their downloads. */
export async function resendDownloads(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  if (order.fulfilmentStatus !== "FULFILLED") back(id, "Files aren't ready yet — retry file generation first.", true);
  const sent = await sendDownloadsReady(id);
  back(id, sent ? `Download link emailed to ${order.email}.` : "The email could not be sent. Check your SMTP settings.", !sent);
}

/** Re-run file generation for a paid order (e.g. after fixing a template). */
export async function retryFulfilment(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const regenerate = form.get("regenerate") === "1";
  await prisma.order.updateMany({
    where: { id, status: { in: ["PAID", "PARTIALLY_REFUNDED"] }, ...(regenerate ? {} : { fulfilmentStatus: { in: ["FAILED", "PENDING"] } }) },
    data: { fulfilmentStatus: "FAILED" },
  });
  const ok = await fulfilOrder(id);
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  back(id, ok ? "Files generated and the customer has been emailed." : `File generation failed: ${order.fulfilmentError ?? "order isn't paid"}`, !ok);
}

/** Pull the latest refund state from Stripe. Refunds themselves are issued in the Stripe dashboard. */
export async function syncRefund(form: FormData) {
  await assertAdmin();
  const id = String(form.get("id"));
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  if (!env.stripeSecretKey || !order.stripePaymentIntentId) back(id, "This order wasn't paid through Stripe, so there's nothing to sync.", true);
  const pi = await getStripe().paymentIntents.retrieve(order.stripePaymentIntentId!, { expand: ["latest_charge"] });
  const charge = pi.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
  await applyRefund(pi.id, charge?.amount_refunded ?? 0);
  back(id, `Refund status synced from Stripe (refunded: $${((charge?.amount_refunded ?? 0) / 100).toFixed(2)}).`);
}

export async function setEntitlementAccess(form: FormData) {
  await assertAdmin();
  const id = String(form.get("orderId"));
  const entId = String(form.get("entitlementId"));
  const action = String(form.get("action"));
  if (action === "revoke") await prisma.downloadEntitlement.update({ where: { id: entId }, data: { revokedAt: new Date() } });
  if (action === "restore") await prisma.downloadEntitlement.update({ where: { id: entId }, data: { revokedAt: null } });
  if (action === "reset") await prisma.downloadEntitlement.update({ where: { id: entId }, data: { downloadCount: 0 } });
  back(id, "Download access updated.");
}
