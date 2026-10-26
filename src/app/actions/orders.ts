"use server";

import { prisma } from "@/lib/db";
import { isValidEmail, normaliseEmail } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { issueAccessToken, orderUrl } from "@/lib/order-access";
import { sendEmail } from "@/lib/email/send";
import { accessLinksEmail } from "@/lib/email/templates";

/** Email fresh links for every paid order on an address. Always responds the same way to avoid revealing orders. */
export async function requestOrderLinks(_prev: { message?: string; error?: string } | null, form: FormData) {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  if (!isValidEmail(email)) return { error: "Please enter the email address you used at checkout." };
  if (!(await rateLimit("lookup", 5, 3600))) return { error: "Too many requests. Please try again later." };
  const orders = await prisma.order.findMany({
    where: { email, status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  if (orders.length) {
    const links = await Promise.all(orders.map(async (o) => ({ number: o.number, url: orderUrl(o.id, await issueAccessToken(o.id)) })));
    await sendEmail({ to: email, ...accessLinksEmail(links), template: "access-links" });
  }
  return { message: "If we have purchases for that email address, we've just sent fresh download links. Please check your inbox (and spam folder)." };
}
