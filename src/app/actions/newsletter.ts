"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { randomToken } from "@/lib/crypto";
import { isValidEmail, normaliseEmail } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { newsletterConfirmEmail } from "@/lib/email/templates";

export type FormState = { ok: boolean; message: string } | null;

const CONSENT_TEXT =
  "I'd like to receive emails from Cardly about new products, special offers, seasonal releases and discount codes. I can unsubscribe at any time.";

export async function subscribeNewsletter(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  if (!isValidEmail(email)) return { ok: false, message: "Please enter a valid email address." };
  if (form.get("consent") !== "on") return { ok: false, message: "Please tick the box to confirm you'd like to receive our emails." };
  if (String(form.get("website") ?? "")) return { ok: true, message: "Thanks! Please check your inbox to confirm." }; // honeypot
  if (!(await rateLimit("newsletter", 5, 3600))) return { ok: false, message: "Too many attempts. Please try again later." };

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.status === "SUBSCRIBED") return { ok: true, message: "You're already subscribed — thank you!" };

  const token = existing?.token ?? randomToken(24);
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, token, status: "PENDING", consentText: CONSENT_TEXT, consentAt: new Date() },
    update: { status: "PENDING", consentText: CONSENT_TEXT, consentAt: new Date(), unsubscribedAt: null },
  });
  const msg = newsletterConfirmEmail(`${env.appUrl}/newsletter/confirm?token=${token}`, `${env.appUrl}/newsletter/unsubscribe?token=${token}`);
  await sendEmail({ to: email, ...msg, template: "newsletter-confirm" });
  return { ok: true, message: "Almost there! Please check your inbox and confirm your subscription." };
}

export async function unsubscribeNewsletter(form: FormData) {
  const token = String(form.get("token") ?? "");
  if (token) {
    await prisma.newsletterSubscriber.updateMany({ where: { token }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } });
  }
  redirect(`/newsletter/unsubscribe?done=1`);
}
