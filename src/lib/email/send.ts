import "server-only";
import nodemailer from "nodemailer";
import { env } from "../env";
import { prisma } from "../db";

export type EmailMessage = { to: string; subject: string; html: string; text: string; template: string; replyTo?: string };

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (!env.smtp.host) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transport;
}

/**
 * Sends via SMTP (works with Resend, Postmark, SendGrid, Amazon SES, Mailgun...).
 * Without SMTP configured, development logs the email instead; production records a failure.
 */
export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    const status = env.isProduction ? "failed" : "logged";
    if (!env.isProduction) {
      console.info(`\n[email:${msg.template}] To: ${msg.to}\nSubject: ${msg.subject}\n${msg.text}\n`);
    } else {
      console.error(`[email] SMTP is not configured; could not send "${msg.subject}" to ${msg.to}`);
    }
    await prisma.emailLog.create({ data: { to: msg.to, subject: msg.subject, template: msg.template, status, error: "SMTP not configured" } });
    return !env.isProduction;
  }
  try {
    await t.sendMail({ from: env.emailFrom, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text, replyTo: msg.replyTo });
    await prisma.emailLog.create({ data: { to: msg.to, subject: msg.subject, template: msg.template, status: "sent" } });
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    await prisma.emailLog.create({
      data: { to: msg.to, subject: msg.subject, template: msg.template, status: "failed", error: String((err as Error).message).slice(0, 500) },
    });
    return false;
  }
}
