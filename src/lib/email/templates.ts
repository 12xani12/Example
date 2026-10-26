import "server-only";
import { env } from "../env";
import { formatAud } from "../money";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(opts: { preheader: string; heading: string; body: string; footerNote?: string }) {
  const logo = `${env.appUrl}/brand/cardly-logo.png`;
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;background:#FFF9F3;font-family:Helvetica,Arial,sans-serif;color:#302C2B;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFF9F3;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(48,44,43,0.08);">
<tr><td style="background:#F5D9D8;padding:28px 32px;text-align:center;">
<a href="${env.appUrl}" style="text-decoration:none;"><img src="${logo}" width="150" alt="Cardly" style="display:inline-block;border:0;max-width:150px;height:auto;"></a>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;margin:0 0 16px;color:#302C2B;">${esc(opts.heading)}</h1>
${opts.body}
</td></tr>
<tr><td style="background:#DCE3D5;padding:20px 32px;font-size:12px;line-height:1.6;color:#4a4544;text-align:center;">
Small Cards. Big Moments.<br>${opts.footerNote ?? ""}
<a href="${env.appUrl}" style="color:#4a4544;">${esc(env.appUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (text: string) => `<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">${text}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#B4596B;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;">${esc(label)}</a></p>`;

export type EmailOrder = {
  number: string;
  createdAt: Date;
  items: { title: string; option: string; summary?: string | null; priceCents: number; discountCents: number }[];
  subtotalCents: number;
  discountCents: number;
  gstCents: number;
  totalCents: number;
  gstMode: string;
  businessName: string;
  abn: string | null;
};

function orderTable(o: EmailOrder) {
  const rows = o.items
    .map(
      (i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #F4E4D6;font-size:14px;">${esc(i.title)}<br><span style="color:#6F6766;font-size:12px;">${esc(i.option)}${i.summary ? ` · ${esc(i.summary)}` : ""}</span></td>
<td style="padding:10px 0;border-bottom:1px solid #F4E4D6;font-size:14px;text-align:right;white-space:nowrap;">${formatAud(i.priceCents)}</td></tr>`,
    )
    .join("");
  const line = (label: string, cents: number, bold = false) =>
    `<tr><td style="padding:4px 0;font-size:14px;${bold ? "font-weight:bold;" : ""}">${label}</td><td style="padding:4px 0;font-size:14px;text-align:right;${bold ? "font-weight:bold;" : ""}">${formatAud(cents)}</td></tr>`;
  let tax = "";
  if (o.gstMode === "INCLUSIVE") tax = line("Includes GST", o.gstCents);
  if (o.gstMode === "EXCLUSIVE") tax = line("GST", o.gstCents);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 18px;">${rows}
${line("Subtotal", o.subtotalCents)}${o.discountCents ? line("Discount", -o.discountCents) : ""}${o.gstMode === "EXCLUSIVE" ? tax : ""}${line("Total paid (AUD)", o.totalCents, true)}${o.gstMode === "INCLUSIVE" ? tax : ""}</table>`;
}

function invoiceHeading(o: EmailOrder) {
  if (o.gstMode === "NOT_REGISTERED") return `Receipt from ${esc(o.businessName)}. No GST has been charged.`;
  return `Tax invoice from ${esc(o.businessName)}${o.abn ? ` · ABN ${esc(o.abn)}` : ""}`;
}

export function orderConfirmationEmail(o: EmailOrder, orderUrl: string) {
  const html = layout({
    preheader: `Thank you for your order ${o.number}`,
    heading: "Thank you for your order",
    body: `${p(`We've received your payment for order <strong>${esc(o.number)}</strong>. Your files are being prepared and we'll email you as soon as they're ready to download (usually within a minute).`)}
${p(`<span style="font-size:12px;color:#6F6766;">${invoiceHeading(o)} · Issued ${o.createdAt.toLocaleDateString("en-AU")}</span>`)}
${orderTable(o)}
${button(orderUrl, "View your order")}
${p(`<span style="font-size:13px;color:#6F6766;">Nothing will be posted to you — all Cardly products are digital downloads.</span>`)}`,
  });
  const text = `Thank you for your order ${o.number}.\n\n${o.items.map((i) => `- ${i.title} (${i.option}) ${formatAud(i.priceCents)}`).join("\n")}\n\nTotal paid: ${formatAud(o.totalCents)}\n${o.gstMode === "NOT_REGISTERED" ? "No GST charged." : `GST: ${formatAud(o.gstCents)}`}\n\nView your order: ${orderUrl}\n`;
  return { subject: `Your Cardly order ${o.number}`, html, text };
}

export function downloadsReadyEmail(o: { number: string; items: string[] }, orderUrl: string, validDays: number) {
  const html = layout({
    preheader: "Your Cardly files are ready",
    heading: "Your download is ready",
    body: `${p(`Good news — the files for order <strong>${esc(o.number)}</strong> are ready.`)}
<ul style="font-size:15px;line-height:1.7;padding-left:20px;margin:0 0 8px;">${o.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
${button(orderUrl, "Download your files")}
${p(`This secure link is personal to you and stays active for ${validDays} days. If it expires, you can request a fresh link any time at <a href="${env.appUrl}/orders/lookup" style="color:#B4596B;">${esc(env.appUrl.replace(/^https?:\/\//, ""))}/orders/lookup</a>.`)}
${p(`<strong>Printing tips:</strong> use A4 card stock (around 200–300 gsm), print at “Actual size” (100%), double-sided and flipped on the <strong>short edge</strong>, then fold in half. Full instructions: <a href="${env.appUrl}/printing-instructions" style="color:#B4596B;">printing instructions</a>.`)}`,
  });
  const text = `Your files for order ${o.number} are ready:\n${o.items.map((i) => `- ${i}`).join("\n")}\n\nDownload: ${orderUrl}\n\nThis link stays active for ${validDays} days. Need a new one? ${env.appUrl}/orders/lookup\n`;
  return { subject: `Your Cardly download is ready (${o.number})`, html, text };
}

export function accessLinksEmail(orders: { number: string; url: string }[]) {
  const html = layout({
    preheader: "Your Cardly purchase links",
    heading: "Here are your purchase links",
    body: `${p("You (or someone using your email address) asked for fresh links to your Cardly purchases.")}
${orders.map((o) => `${p(`Order <strong>${esc(o.number)}</strong>`)}${button(o.url, "Open order")}`).join("")}
${p(`<span style="font-size:13px;color:#6F6766;">If you didn't request this, you can safely ignore this email.</span>`)}`,
  });
  const text = `Your Cardly purchase links:\n${orders.map((o) => `${o.number}: ${o.url}`).join("\n")}\n`;
  return { subject: "Your Cardly purchase links", html, text };
}

export function passwordResetEmail(url: string) {
  const html = layout({
    preheader: "Reset your Cardly password",
    heading: "Reset your password",
    body: `${p("We received a request to reset the password for your Cardly account. This link expires in one hour.")}${button(url, "Choose a new password")}${p(`<span style="font-size:13px;color:#6F6766;">If you didn't ask for this, you can ignore this email — your password won't change.</span>`)}`,
  });
  return { subject: "Reset your Cardly password", html, text: `Reset your Cardly password (link expires in 1 hour): ${url}\n` };
}

export function contactNotificationEmail(m: { name: string; email: string; orderNumber?: string | null; subject: string; message: string }) {
  const html = layout({
    preheader: `New enquiry: ${m.subject}`,
    heading: "New contact form enquiry",
    body: `${p(`<strong>From:</strong> ${esc(m.name)} &lt;${esc(m.email)}&gt;`)}${m.orderNumber ? p(`<strong>Order:</strong> ${esc(m.orderNumber)}`) : ""}${p(`<strong>Subject:</strong> ${esc(m.subject)}`)}
<div style="white-space:pre-wrap;font-size:15px;line-height:1.6;background:#FFF9F3;border-radius:12px;padding:16px;">${esc(m.message)}</div>
${button(`${env.appUrl}/admin/messages`, "Open admin inbox")}`,
  });
  const text = `New enquiry from ${m.name} <${m.email}>\nOrder: ${m.orderNumber ?? "-"}\nSubject: ${m.subject}\n\n${m.message}\n`;
  return { subject: `[Cardly enquiry] ${m.subject}`, html, text };
}

export function newsletterConfirmEmail(confirmUrl: string, unsubscribeUrl: string) {
  const html = layout({
    preheader: "Please confirm your subscription",
    heading: "Confirm your subscription",
    body: `${p("Thanks for joining the Cardly list! Please confirm that you'd like to receive emails about new designs, seasonal releases, special offers and discount codes.")}${button(confirmUrl, "Yes, subscribe me")}${p(`<span style="font-size:13px;color:#6F6766;">Didn't sign up? Ignore this email and you won't be subscribed.</span>`)}`,
    footerNote: `<a href="${unsubscribeUrl}" style="color:#4a4544;">Unsubscribe</a><br>`,
  });
  return { subject: "Please confirm your Cardly subscription", html, text: `Confirm your Cardly subscription: ${confirmUrl}\n\nUnsubscribe: ${unsubscribeUrl}\n` };
}

export function newsletterWelcomeEmail(unsubscribeUrl: string) {
  const html = layout({
    preheader: "Welcome to Cardly",
    heading: "You're on the list",
    body: `${p("Thank you for subscribing. We'll let you know about new designs, seasonal collections and special offers — never too often.")}${button(`${env.appUrl}/shop`, "Browse the shop")}`,
    footerNote: `You can <a href="${unsubscribeUrl}" style="color:#4a4544;">unsubscribe</a> at any time.<br>`,
  });
  return { subject: "Welcome to Cardly", html, text: `Welcome to Cardly! Unsubscribe any time: ${unsubscribeUrl}\n` };
}
