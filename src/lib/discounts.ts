import "server-only";
import { prisma } from "./db";
import type { DiscountRule } from "./pricing";

export type ValidDiscount = { id: string; code: string; rule: DiscountRule; description: string };

export function normaliseCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export async function findDiscount(codeInput: string): Promise<{ ok: true; discount: ValidDiscount } | { ok: false; error: string }> {
  const code = normaliseCode(codeInput);
  if (!code) return { ok: false, error: "Please enter a discount code." };
  const d = await prisma.discountCode.findUnique({ where: { code }, include: { categories: { select: { id: true } } } });
  const now = new Date();
  if (!d || !d.active) return { ok: false, error: "Sorry, that discount code isn't valid." };
  if (d.startsAt && d.startsAt > now) return { ok: false, error: "That discount code isn't active yet." };
  if (d.expiresAt && d.expiresAt < now) return { ok: false, error: "Sorry, that discount code has expired." };
  if (d.maxUses !== null && d.usedCount >= d.maxUses) return { ok: false, error: "Sorry, that discount code has reached its usage limit." };
  return {
    ok: true,
    discount: {
      id: d.id,
      code: d.code,
      description: d.description,
      rule: { type: d.type, value: d.value, categoryIds: d.categories.map((c) => c.id), minSubtotalCents: d.minSubtotalCents },
    },
  };
}
