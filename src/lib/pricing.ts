// Pure pricing maths shared by the cart, checkout and tests.

export type GstMode = "NOT_REGISTERED" | "INCLUSIVE" | "EXCLUSIVE";

export type PricedLine = { priceCents: number; categoryIds: string[] };

export type DiscountRule = {
  type: "PERCENT" | "FIXED";
  value: number;
  /** Empty = applies to every item. */
  categoryIds: string[];
  minSubtotalCents: number;
};

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  lineDiscounts: number[];
  gstCents: number;
  totalCents: number;
  discountApplied: boolean;
  discountMessage?: string;
};

export function lineIsEligible(line: PricedLine, rule: DiscountRule): boolean {
  return rule.categoryIds.length === 0 || line.categoryIds.some((id) => rule.categoryIds.includes(id));
}

/** Split `amount` across `weights` proportionally, keeping the exact total. */
export function allocate(amount: number, weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0 || amount === 0) return weights.map(() => 0);
  const raw = weights.map((w) => (amount * w) / total);
  const floored = raw.map(Math.floor);
  let remainder = amount - floored.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    floored[i] += 1;
    remainder -= 1;
  }
  return floored;
}

export function computeTotals(
  lines: PricedLine[],
  rule: DiscountRule | null,
  gstMode: GstMode,
  gstRatePercent: number,
): Totals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents, 0);
  let lineDiscounts = lines.map(() => 0);
  let discountApplied = false;
  let discountMessage: string | undefined;

  if (rule) {
    const eligible = lines.map((l) => (lineIsEligible(l, rule) ? l.priceCents : 0));
    const eligibleTotal = eligible.reduce((a, b) => a + b, 0);
    if (subtotalCents < rule.minSubtotalCents) {
      discountMessage = "Your cart doesn't meet the minimum spend for this code yet.";
    } else if (eligibleTotal === 0) {
      discountMessage = "This code doesn't apply to the items in your cart.";
    } else {
      const amount =
        rule.type === "PERCENT"
          ? Math.round((eligibleTotal * Math.min(Math.max(rule.value, 0), 100)) / 100)
          : Math.min(Math.max(rule.value, 0), eligibleTotal);
      lineDiscounts = allocate(amount, eligible);
      discountApplied = amount > 0;
    }
  }

  const discountCents = lineDiscounts.reduce((a, b) => a + b, 0);
  const net = subtotalCents - discountCents;
  let gstCents = 0;
  let totalCents = net;
  if (gstMode === "INCLUSIVE") {
    gstCents = Math.round((net * gstRatePercent) / (100 + gstRatePercent));
  } else if (gstMode === "EXCLUSIVE") {
    gstCents = Math.round((net * gstRatePercent) / 100);
    totalCents = net + gstCents;
  }
  return { subtotalCents, discountCents, lineDiscounts, gstCents, totalCents, discountApplied, discountMessage };
}
