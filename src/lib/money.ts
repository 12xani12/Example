export function formatAud(cents: number): string {
  const value = (cents / 100).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });
  // en-AU renders "$2.50"; make the currency explicit for overseas visitors.
  return `${value} AUD`;
}

export function formatAudShort(cents: number): string {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

/** Parse "4", "4.5", "$4.50" into cents. Returns null for invalid input. */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]|AUD/gi, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}
