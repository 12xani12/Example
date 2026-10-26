import "server-only";
import { Prisma, type VariantKind } from "@prisma/client";
import { prisma } from "./db";
import { storage } from "./storage";
import { fileSafeTitle } from "./slug";
import { generatePrintableCardPdf, generateVirtualCardFiles } from "./files/card-files";
import { defaultPersonalisation, summarise, type Personalisation, type TemplateSettings } from "./card/personalisation";
import { sendEmail } from "./email/send";
import { downloadsReadyEmail, orderConfirmationEmail } from "./email/templates";
import { issueAccessToken, orderUrl } from "./order-access";
import { getDownloadSettings } from "./settings";

type PaidInput = {
  orderId: string;
  provider: "stripe" | "mock";
  providerRef: string;
  amountCents: number;
  currency: string;
  paymentIntentId?: string | null;
};

/**
 * Mark an order paid after a verified payment confirmation.
 * Idempotent: safe to call repeatedly for the same payment (webhook retries,
 * success page reloads). Returns true only for the call that changed state.
 */
export async function markOrderPaid(input: PaidInput): Promise<{ changed: boolean; reason?: string }> {
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });
  if (!order) return { changed: false, reason: "order-not-found" };
  if (input.currency.toLowerCase() !== order.currency || input.amountCents !== order.totalCents) {
    console.error(`[payments] amount mismatch for order ${order.number}: expected ${order.totalCents} ${order.currency}, got ${input.amountCents} ${input.currency}`);
    return { changed: false, reason: "amount-mismatch" };
  }

  const changed = await prisma.$transaction(async (tx) => {
    const res = await tx.order.updateMany({
      where: { id: order.id, status: { in: ["PENDING", "FAILED", "CANCELLED"] } },
      data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: input.paymentIntentId ?? undefined },
    });
    if (res.count === 0) return false;
    await tx.payment.upsert({
      where: { provider_providerRef: { provider: input.provider, providerRef: input.providerRef } },
      create: { orderId: order.id, provider: input.provider, providerRef: input.providerRef, amountCents: input.amountCents, status: "succeeded" },
      update: {},
    });
    if (order.discountCodeId) {
      await tx.discountCode.update({ where: { id: order.discountCodeId }, data: { usedCount: { increment: 1 } } });
    }
    return true;
  });

  if (changed) {
    await sendConfirmation(order.id).catch((e) => console.error("[orders] confirmation email failed", e));
    await fulfilOrder(order.id).catch((e) => console.error("[orders] fulfilment failed", e));
  }
  return { changed };
}

async function loadArtwork(t: { frontArtKey: string | null; insideArtKey: string | null; backArtKey: string | null }) {
  const get = (k: string | null) => (k ? storage().get(k) : Promise.resolve(null));
  const [front, inside, back] = await Promise.all([get(t.frontArtKey), get(t.insideArtKey), get(t.backArtKey)]);
  return { front, inside, back };
}

function templateSettings(t: Prisma.CardTemplateGetPayload<object>): TemplateSettings {
  return t;
}

type GeneratedFile = { filename: string; label: string; contentType: string; body: Buffer };

async function filesForItem(item: Prisma.OrderItemGetPayload<{ include: { product: { include: { template: true; files: true } } } }>): Promise<GeneratedFile[]> {
  const product = item.product;
  if (!product) throw new Error(`Product for "${item.title}" no longer exists`);
  const base = `Cardly-${fileSafeTitle(item.title)}`;
  const kind: VariantKind = item.variantKind;

  // Uploaded deliverables take priority for ready-made purchases.
  const uploads = product.files.filter((f) => f.variantKind === null || f.variantKind === kind);
  if (kind === "READY_MADE" && uploads.length) {
    const out: GeneratedFile[] = [];
    for (const f of uploads) {
      const body = await storage().get(f.key);
      if (!body) throw new Error(`Missing uploaded file ${f.filename}`);
      out.push({ filename: f.filename, label: f.filename, contentType: f.contentType, body });
    }
    return out;
  }

  const t = product.template;
  if (!t || !t.frontArtKey) throw new Error(`No deliverable configured for "${item.title}"`);
  const settings = templateSettings(t);
  const artwork = await loadArtwork(t);
  let personalisation: Personalisation | null = null;
  if (kind === "PERSONALISED") {
    personalisation = item.personalisation as Personalisation;
  } else if (t.readyMadeMessage.trim()) {
    personalisation = { ...defaultPersonalisation(settings), message: t.readyMadeMessage };
  }
  const suffix = kind === "PERSONALISED" ? "Personalised" : "Printable";

  if (item.format === "VIRTUAL") {
    const v = await generateVirtualCardFiles({ title: item.title, template: settings, personalisation, artwork });
    const vSuffix = kind === "PERSONALISED" ? "Personalised" : "Virtual";
    const files: GeneratedFile[] = [];
    if (v.frontPng) files.push({ filename: `${base}-${vSuffix}-Front.png`, label: "Card front (PNG image)", contentType: "image/png", body: v.frontPng });
    files.push({ filename: `${base}-${vSuffix}-Message.png`, label: "Message page (PNG image)", contentType: "image/png", body: v.messagePng });
    files.push({ filename: `${base}-${vSuffix}.pdf`, label: "Digital card (PDF)", contentType: "application/pdf", body: Buffer.from(v.pdf) });
    // Uploaded extras (e.g. an animated version) are added alongside.
    for (const f of uploads) {
      const body = await storage().get(f.key);
      if (body) files.push({ filename: f.filename, label: f.filename, contentType: f.contentType, body });
    }
    return files;
  }

  const pdf = await generatePrintableCardPdf({ title: item.title, template: settings, personalisation, artwork });
  return [{ filename: `${base}-${suffix}.pdf`, label: "Printable card (PDF, A4 folds to A5)", contentType: "application/pdf", body: Buffer.from(pdf) }];
}

/** Generate and store every file for a paid order, then email the customer. Safe to retry. */
export async function fulfilOrder(orderId: string, opts: { notify?: boolean } = {}) {
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: { in: ["PAID", "PARTIALLY_REFUNDED"] }, fulfilmentStatus: { in: ["PENDING", "FAILED"] } },
    data: { fulfilmentStatus: "PROCESSING", fulfilmentError: null },
  });
  if (claimed.count === 0) return false;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: { include: { template: true, files: true } } } } },
  });
  const { maxDownloadsPerFile } = await getDownloadSettings();
  try {
    for (const item of order.items) {
      const files = await filesForItem(item);
      for (const file of files) {
        const key = `private/orders/${order.id}/${item.id}/${file.filename}`;
        await storage().put(key, file.body, file.contentType);
        await prisma.downloadEntitlement.upsert({
          where: { orderItemId_filename: { orderItemId: item.id, filename: file.filename } },
          create: {
            orderId: order.id,
            orderItemId: item.id,
            key,
            filename: file.filename,
            label: file.label,
            contentType: file.contentType,
            maxDownloads: maxDownloadsPerFile > 0 ? maxDownloadsPerFile : null,
          },
          update: { key, label: file.label, contentType: file.contentType },
        });
      }
    }
    await prisma.order.update({ where: { id: order.id }, data: { fulfilmentStatus: "FULFILLED" } });
  } catch (err) {
    console.error(`[fulfilment] order ${order.number} failed`, err);
    await prisma.order.update({ where: { id: order.id }, data: { fulfilmentStatus: "FAILED", fulfilmentError: String((err as Error).message).slice(0, 500) } });
    return false;
  }
  if (opts.notify !== false) await sendDownloadsReady(order.id);
  return true;
}

export async function sendConfirmation(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const token = await issueAccessToken(order.id);
  const msg = orderConfirmationEmail(
    {
      ...order,
      items: order.items.map((i) => ({
        title: i.title,
        option: i.variantKind === "PERSONALISED" ? "Personalised" : "Ready-made",
        summary: i.personalisation ? summarise(i.personalisation as Personalisation) : null,
        priceCents: i.unitPriceCents,
        discountCents: i.discountCents,
      })),
    },
    orderUrl(order.id, token),
  );
  await sendEmail({ to: order.email, ...msg, template: "order-confirmation" });
  await prisma.order.update({ where: { id: order.id }, data: { confirmationSentAt: new Date() } });
}

/** Email a fresh secure link to the order's downloads. */
export async function sendDownloadsReady(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  const token = await issueAccessToken(order.id);
  const { accessLinkDays } = await getDownloadSettings();
  const msg = downloadsReadyEmail({ number: order.number, items: order.items.map((i) => i.title) }, orderUrl(order.id, token), accessLinkDays);
  return sendEmail({ to: order.email, ...msg, template: "downloads-ready" });
}
