import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { env } from "./env";
import { randomToken } from "./crypto";
import { computeTotals, type Totals } from "./pricing";
import { findDiscount } from "./discounts";
import { getBusinessSettings } from "./settings";
import { productInclude, purchasableVariants, frontImage } from "./catalog";
import { summarise, type Personalisation } from "./card/personalisation";

const CART_COOKIE = "cardly_cart";

export async function getCartId(create: boolean): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) {
    const cart = await prisma.cart.findUnique({ where: { id: existing }, select: { id: true } });
    if (cart) return cart.id;
  }
  if (!create) return null;
  const id = randomToken(24);
  await prisma.cart.create({ data: { id } });
  jar.set(CART_COOKIE, id, { httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/", maxAge: 60 * 86400 });
  return id;
}

export async function clearCartCookie() {
  (await cookies()).delete(CART_COOKIE);
}

export type CartLine = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  type: string;
  format: "PRINTABLE" | "VIRTUAL";
  variantKind: "READY_MADE" | "PERSONALISED";
  priceCents: number;
  discountCents: number;
  image: { src: string; alt: string } | null;
  personalisation: Personalisation | null;
  summary: string | null;
  available: boolean;
  categoryIds: string[];
};

export type CartView = {
  id: string | null;
  lines: CartLine[];
  totals: Totals;
  discountCode: string | null;
  discountError: string | null;
  gstMode: string;
  gstRatePercent: number;
  hasUnavailable: boolean;
};

export async function getCartView(): Promise<CartView> {
  const business = await getBusinessSettings();
  const id = await getCartId(false);
  const cart = id
    ? await prisma.cart.findUnique({
        where: { id },
        include: { items: { orderBy: { createdAt: "asc" }, include: { product: { include: productInclude }, variant: true } } },
      })
    : null;

  const lines: CartLine[] = (cart?.items ?? []).map((item) => {
    const p = item.product;
    const available = purchasableVariants(p).some((v) => v.id === item.variantId);
    const pers = (item.personalisation as Personalisation | null) ?? null;
    const img = frontImage(p);
    return {
      id: item.id,
      productId: p.id,
      slug: p.slug,
      title: p.title,
      type: p.type,
      format: p.format,
      variantKind: item.variant.kind,
      priceCents: item.variant.priceCents,
      discountCents: 0,
      image: img ? { src: img.src, alt: img.alt } : null,
      personalisation: pers,
      summary: pers ? summarise(pers) : null,
      available,
      categoryIds: p.categories.map((c) => c.categoryId),
    };
  });

  const purchasable = lines.filter((l) => l.available);
  let discountError: string | null = null;
  let rule = null;
  if (cart?.discountCode) {
    const found = await findDiscount(cart.discountCode);
    if (found.ok) rule = found.discount.rule;
    else discountError = found.error;
  }
  const totals = computeTotals(
    purchasable.map((l) => ({ priceCents: l.priceCents, categoryIds: l.categoryIds })),
    rule,
    business.gstMode,
    business.gstRatePercent,
  );
  purchasable.forEach((l, i) => (l.discountCents = totals.lineDiscounts[i] ?? 0));
  if (rule && !totals.discountApplied) discountError = totals.discountMessage ?? "This code doesn't apply to your cart.";

  return {
    id: cart?.id ?? null,
    lines,
    totals,
    discountCode: cart?.discountCode ?? null,
    discountError,
    gstMode: business.gstMode,
    gstRatePercent: business.gstRatePercent,
    hasUnavailable: lines.some((l) => !l.available),
  };
}

export async function cartCount(): Promise<number> {
  const id = await getCartId(false);
  if (!id) return 0;
  return prisma.cartItem.count({ where: { cartId: id } });
}
