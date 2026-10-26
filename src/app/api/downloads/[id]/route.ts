import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { verifyDownloadSignature } from "@/lib/order-access";

/**
 * Streams a purchased file. The short-lived signature was issued only after a
 * server-side access check on the order page, and the order state is rechecked here.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  if (!verifyDownloadSignature(id, url.searchParams.get("exp"), url.searchParams.get("sig"))) {
    return new Response("This download link has expired. Please reopen your order page to get a fresh link.", { status: 403 });
  }
  const ent = await prisma.downloadEntitlement.findUnique({ where: { id }, include: { order: { select: { status: true } } } });
  if (!ent || ent.revokedAt) return new Response("Not found", { status: 404 });
  if (ent.order.status !== "PAID" && ent.order.status !== "PARTIALLY_REFUNDED") return new Response("This order isn't available for download.", { status: 403 });

  // Atomically enforce the optional per-file download limit.
  const updated = await prisma.downloadEntitlement.updateMany({
    where: { id, ...(ent.maxDownloads !== null ? { downloadCount: { lt: ent.maxDownloads } } : {}) },
    data: { downloadCount: { increment: 1 }, lastAccessAt: new Date() },
  });
  if (updated.count === 0) return new Response("Download limit reached. Please contact us and we'll help.", { status: 429 });

  const body = await storage().get(ent.key);
  if (!body) return new Response("File missing. Please contact us.", { status: 500 });
  await prisma.downloadEvent.create({ data: { entitlementId: id } });
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": ent.contentType,
      "Content-Length": String(body.length),
      "Content-Disposition": `attachment; filename="${ent.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
