"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

/** Return to the same filter the admin was viewing (whitelisted, not trusted). */
function back(form: FormData, extra: string) {
  const filter = str(form, "filter") === "open" ? "filter=open&" : "";
  redirect(`/admin/messages?${filter}${extra}`);
}

export async function toggleMessageHandled(form: FormData) {
  await assertAdmin();
  const id = str(form, "id");
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (message) await prisma.contactMessage.update({ where: { id }, data: { handled: !message.handled } });
  revalidatePath("/admin", "layout");
  back(form, "saved=1");
}

export async function deleteMessage(form: FormData) {
  await assertAdmin();
  await prisma.contactMessage.deleteMany({ where: { id: str(form, "id") } });
  revalidatePath("/admin", "layout");
  back(form, "deleted=1");
}
