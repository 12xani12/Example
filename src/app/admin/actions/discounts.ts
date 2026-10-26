"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { DiscountType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { normaliseCode } from "@/lib/discounts";
import { parseDollarsToCents } from "@/lib/money";

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

function fail(id: string | null, msg: string): never {
  redirect(`${id ? `/admin/discounts/${id}` : "/admin/discounts/new"}?error=${encodeURIComponent(msg)}`);
}

/** "2026-12-01T09:00" from <input type="datetime-local"> is read in the server's local time. */
function parseLocal(value: string): Date | null | "invalid" {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return "invalid";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}

export async function saveDiscount(form: FormData) {
  await assertAdmin();
  const id = str(form, "id") || null;
  if (id && !(await prisma.discountCode.findUnique({ where: { id } }))) redirect(`/admin/discounts?error=${encodeURIComponent("That discount code no longer exists.")}`);

  const code = normaliseCode(str(form, "code"));
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) fail(id, "Codes must be 2–40 characters using only letters, numbers, - and _.");
  const clash = await prisma.discountCode.findFirst({ where: { code, ...(id ? { id: { not: id } } : {}) } });
  if (clash) fail(id, `The code ${code} already exists.`);

  const type = str(form, "type") as DiscountType;
  if (type !== "PERCENT" && type !== "FIXED") fail(id, "Please choose a discount type.");
  let value: number;
  if (type === "PERCENT") {
    value = Number(str(form, "value").replace(/%$/, ""));
    if (!Number.isInteger(value) || value < 1 || value > 100) fail(id, "Percentage discounts must be a whole number from 1 to 100.");
  } else {
    const cents = parseDollarsToCents(str(form, "value"));
    if (cents === null || cents < 1) fail(id, "Enter the fixed discount in dollars, e.g. 5 or 2.50.");
    value = cents;
  }

  const minSubtotalCents = str(form, "minSubtotal") ? parseDollarsToCents(str(form, "minSubtotal")) : 0;
  if (minSubtotalCents === null) fail(id, "Enter the minimum subtotal in dollars, or leave it blank.");

  const startsAt = parseLocal(str(form, "startsAt"));
  const expiresAt = parseLocal(str(form, "expiresAt"));
  if (startsAt === "invalid" || expiresAt === "invalid") fail(id, "Please enter valid start and expiry dates.");
  if (startsAt && expiresAt && expiresAt <= startsAt) fail(id, "The expiry date must be after the start date.");

  let maxUses: number | null = null;
  if (str(form, "maxUses")) {
    maxUses = Number(str(form, "maxUses"));
    if (!Number.isInteger(maxUses) || maxUses < 1) fail(id, "Maximum uses must be a whole number of 1 or more, or blank for unlimited.");
  }

  // Only keep ids that really are categories.
  const requested = form.getAll("categories").map(String).filter(Boolean);
  const categories = requested.length ? await prisma.category.findMany({ where: { id: { in: requested } }, select: { id: true } }) : [];

  const data = {
    code,
    description: str(form, "description").slice(0, 300),
    type,
    value,
    minSubtotalCents,
    startsAt,
    expiresAt,
    maxUses,
    active: form.get("active") === "on",
  };
  const saved = id
    ? await prisma.discountCode.update({ where: { id }, data: { ...data, categories: { set: categories } } })
    : await prisma.discountCode.create({ data: { ...data, categories: { connect: categories } } });
  revalidatePath("/admin/discounts");
  redirect(`/admin/discounts/${saved.id}?saved=1`);
}

export async function deleteDiscount(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const discount = await prisma.discountCode.findUnique({ where: { id } });
  if (!discount) redirect(`/admin/discounts?error=${encodeURIComponent("That discount code no longer exists.")}`);
  if (normaliseCode(str(form, "confirm")) !== discount.code) fail(id, `Type the code (${discount.code}) to confirm.`);
  // Past orders keep their discountCodeText snapshot; the relation is set to null.
  await prisma.discountCode.delete({ where: { id } });
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?deleted=1");
}
