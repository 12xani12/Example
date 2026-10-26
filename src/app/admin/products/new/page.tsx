import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader, Notice } from "../../ui";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "New product" };

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }] });
  return (
    <>
      <AdminHeader title="Add a product" intro="Start with the details and prices. After saving you can upload images, downloadable files and set up personalisation." />
      {error && <Notice tone="blush">{error}</Notice>}
      <ProductForm categories={categories} />
    </>
  );
}
