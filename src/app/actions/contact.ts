"use server";

import { prisma } from "@/lib/db";
import { isValidEmail, normaliseEmail } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { contactNotificationEmail } from "@/lib/email/templates";
import { getBusinessSettings } from "@/lib/settings";

type State = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | null;

export async function submitContact(_prev: State, form: FormData): Promise<State> {
  const data = {
    name: String(form.get("name") ?? "").trim().slice(0, 120),
    email: normaliseEmail(String(form.get("email") ?? "")),
    orderNumber: String(form.get("orderNumber") ?? "").trim().toUpperCase().slice(0, 40) || null,
    subject: String(form.get("subject") ?? "").trim().slice(0, 160),
    message: String(form.get("message") ?? "").trim().slice(0, 5000),
  };
  if (String(form.get("company") ?? "")) return { ok: true }; // honeypot
  const fieldErrors: Record<string, string> = {};
  if (!data.name) fieldErrors.name = "Please tell us your name.";
  if (!isValidEmail(data.email)) fieldErrors.email = "Please enter a valid email address so we can reply.";
  if (!data.subject) fieldErrors.subject = "Please add a subject.";
  if (data.message.length < 10) fieldErrors.message = "Please write a little more so we can help.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  if (!(await rateLimit("contact", 5, 3600))) return { error: "You've sent several messages recently. Please try again a little later." };

  await prisma.contactMessage.create({ data });
  const { supportEmail } = await getBusinessSettings();
  await sendEmail({ to: supportEmail, replyTo: data.email, ...contactNotificationEmail(data), template: "contact-notification" });
  return { ok: true };
}
