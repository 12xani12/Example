import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";

/** Fixed-window limiter stored in Postgres (works across serverless instances). */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const ip = await clientIp();
  const key = `${bucket}:${ip}`;
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowSeconds * 1000) },
    });
    return true;
  }
  if (row.count >= limit) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
