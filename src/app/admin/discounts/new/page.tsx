import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Notice } from "../../ui";
import { DiscountForm } from "../DiscountForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New discount" };

export default async function NewDiscount({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] });
  return (
    <>
      <AdminHeader title="Add a discount" intro="Codes apply to the cart subtotal before GST is calculated." />
      {error && <Notice tone="blush">{error}</Notice>}
      <DiscountForm categories={categories} />
    </>
  );
}
