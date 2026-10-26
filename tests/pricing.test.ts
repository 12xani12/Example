import { describe, expect, it } from "vitest";
import { allocate, computeTotals } from "@/lib/pricing";
import { parseDollarsToCents } from "@/lib/money";

const lines = [
  { priceCents: 250, categoryIds: ["birthday"] },
  { priceCents: 400, categoryIds: ["birthday"] },
  { priceCents: 500, categoryIds: ["planners"] },
];

describe("allocate", () => {
  it("keeps the exact total", () => {
    expect(allocate(100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(allocate(7, [250, 400, 0])).toEqual([3, 4, 0]);
  });
});

describe("computeTotals", () => {
  it("sums without discount or GST", () => {
    const t = computeTotals(lines, null, "NOT_REGISTERED", 10);
    expect(t).toMatchObject({ subtotalCents: 1150, discountCents: 0, gstCents: 0, totalCents: 1150 });
  });

  it("applies percentage discounts only to eligible categories", () => {
    const t = computeTotals(lines, { type: "PERCENT", value: 10, categoryIds: ["birthday"], minSubtotalCents: 0 }, "NOT_REGISTERED", 10);
    expect(t.discountCents).toBe(65);
    expect(t.lineDiscounts[2]).toBe(0);
    expect(t.totalCents).toBe(1085);
  });

  it("caps fixed discounts at the eligible amount", () => {
    const t = computeTotals(lines, { type: "FIXED", value: 5000, categoryIds: ["planners"], minSubtotalCents: 0 }, "NOT_REGISTERED", 10);
    expect(t.discountCents).toBe(500);
    expect(t.totalCents).toBe(650);
  });

  it("respects minimum spend", () => {
    const t = computeTotals(lines, { type: "PERCENT", value: 50, categoryIds: [], minSubtotalCents: 2000 }, "NOT_REGISTERED", 10);
    expect(t.discountApplied).toBe(false);
    expect(t.discountMessage).toMatch(/minimum/);
  });

  it("extracts GST from GST-inclusive prices", () => {
    const t = computeTotals([{ priceCents: 1100, categoryIds: [] }], null, "INCLUSIVE", 10);
    expect(t.gstCents).toBe(100);
    expect(t.totalCents).toBe(1100);
  });

  it("adds GST for GST-exclusive prices", () => {
    const t = computeTotals([{ priceCents: 1000, categoryIds: [] }], null, "EXCLUSIVE", 10);
    expect(t.gstCents).toBe(100);
    expect(t.totalCents).toBe(1100);
  });
});

describe("parseDollarsToCents", () => {
  it("parses common formats", () => {
    expect(parseDollarsToCents("2.50")).toBe(250);
    expect(parseDollarsToCents("$4")).toBe(400);
    expect(parseDollarsToCents("4.5 AUD")).toBe(450);
    expect(parseDollarsToCents("abc")).toBeNull();
    expect(parseDollarsToCents("1.234")).toBeNull();
  });
});
