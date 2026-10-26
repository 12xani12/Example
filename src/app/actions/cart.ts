"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCartId } from "@/lib/cart";
import { productInclude, purchasableVariants } from "@/lib/catalog";
import { parsePersonalisation } from "@/lib/card/personalisation";
import { layoutMessage, layoutProblems } from "@/lib/card/layout";
import { cardFont } from "@/lib/files/fonts";
import { findDiscount, normaliseCode } from "@/lib/discounts";

export type ActionResult = { ok: true; redirect?: string } | { ok: false; error: string };

export async function addToCart(input: { productId: string; kind: "READY_MADE" | "PERSONALISED"; personalisation?: unknown; editItemId?: string }): Promise<ActionResult> {
  const product = await prisma.product.findUnique({ where: { id: input.productId }, include: productInclude });
  if (!product) return { ok: false, error: "Sorry, we couldn't find that product." };
  const variant = purchasableVariants(product).find((v) => v.kind === input.kind);
  if (!variant) return { ok: false, error: "Sorry, this option isn't available to purchase right now." };

  let personalisation = undefined;
  if (input.kind === "PERSONALISED") {
    if (!product.template?.personalisable) return { ok: false, error: "This design can't be personalised." };
    const parsed = parsePersonalisation(input.personalisation, product.template);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const problems = layoutProblems(layoutMessage(parsed.value, product.template, cardFont(parsed.value.font)));
    if (problems.length) return { ok: false, error: problems[0] };
    personalisation = parsed.value;
  }

  const cartId = await getCartId(true);
  if (!cartId) return { ok: false, error: "We couldn't open your cart. Please make sure cookies are enabled." };

  if (input.editItemId) {
    const existing = await prisma.cartItem.findFirst({ where: { id: input.editItemId, cartId } });
    if (!existing) return { ok: false, error: "That cart item no longer exists. Please add the card again." };
    await prisma.cartItem.update({ where: { id: existing.id }, data: { variantId: variant.id, personalisation } });
  } else if (input.kind === "READY_MADE") {
    // Digital ready-made files only need to be bought once.
    const dup = await prisma.cartItem.findFirst({ where: { cartId, variantId: variant.id } });
    if (!dup) await prisma.cartItem.create({ data: { cartId, productId: product.id, variantId: variant.id } });
  } else {
    // Each personalised message is its own item, even for the same design.
    await prisma.cartItem.create({ data: { cartId, productId: product.id, variantId: variant.id, personalisation } });
  }
  revalidatePath("/", "layout");
  return { ok: true, redirect: "/cart?added=1" };
}

export async function removeFromCart(itemId: string) {
  const cartId = await getCartId(false);
  if (!cartId) return;
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
  revalidatePath("/", "layout");
}

export async function applyDiscountCode(_prev: { error?: string; ok?: boolean } | null, form: FormData) {
  const code = normaliseCode(String(form.get("code") ?? ""));
  const found = await findDiscount(code);
  if (!found.ok) return { error: found.error };
  const cartId = await getCartId(true);
  if (!cartId) return { error: "We couldn't open your cart." };
  await prisma.cart.update({ where: { id: cartId }, data: { discountCode: found.discount.code } });
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeDiscountCode() {
  const cartId = await getCartId(false);
  if (!cartId) return;
  await prisma.cart.update({ where: { id: cartId }, data: { discountCode: null } });
  revalidatePath("/cart");
}
