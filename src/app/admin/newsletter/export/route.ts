import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Quote a CSV cell, neutralising values a spreadsheet would run as a formula. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const rows = await prisma.newsletterSubscriber.findMany({
    where: { status: "SUBSCRIBED" },
    orderBy: { confirmedAt: "asc" },
    select: { email: true, consentAt: true, confirmedAt: true, consentText: true },
  });
  const lines = [
    ["email", "consentAt", "confirmedAt", "consentText"].map(cell).join(","),
    ...rows.map((r) => [r.email, r.consentAt.toISOString(), r.confirmedAt?.toISOString() ?? "", r.consentText].map(cell).join(",")),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cardly-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
