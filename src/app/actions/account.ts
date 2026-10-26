"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { createSession, destroySession, getCurrentUser, hashPassword, isValidEmail, normaliseEmail, passwordProblem, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { randomToken, sha256 } from "@/lib/crypto";
import { sendEmail } from "@/lib/email/send";
import { passwordResetEmail } from "@/lib/email/templates";
import { checkOrderAccess } from "@/lib/order-access";

type State = { error?: string; message?: string } | null;

function safeNext(next: FormDataEntryValue | null) {
  const n = String(next ?? "");
  return n.startsWith("/") && !n.startsWith("//") ? n : "/account";
}

// A fixed dummy hash keeps login timing similar whether or not the account exists.
const DUMMY_HASH = "$2b$12$b9fu5zI8R1wNDUyWwIrww.8mreMuaYXDHIP5ahdQedURuO3vjMphq";

export async function login(_prev: State, form: FormData): Promise<State> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!(await rateLimit("login", 10, 900))) return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.passwordHash || !ok) return { error: "That email and password combination didn't match. Please try again." };
  await createSession(user.id);
  const next = safeNext(form.get("next"));
  redirect(user.role === "ADMIN" && next === "/account" ? "/admin" : next);
}

export async function register(_prev: State, form: FormData): Promise<State> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const password = String(form.get("password") ?? "");
  if (!isValidEmail(email)) return { error: "Please enter a valid email address." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (!(await rateLimit("register", 5, 3600))) return { error: "Too many attempts. Please try again later." };
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "An account with this email already exists. Try signing in or resetting your password." };
  }
  const user = await prisma.user.create({ data: { email, name: name || null, passwordHash: await hashPassword(password) } });
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_prev: State, form: FormData): Promise<State> {
  const email = normaliseEmail(String(form.get("email") ?? ""));
  if (!isValidEmail(email)) return { error: "Please enter a valid email address." };
  if (!(await rateLimit("reset", 5, 3600))) return { error: "Too many requests. Please try again later." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = randomToken();
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600_000) } });
    await sendEmail({ to: email, ...passwordResetEmail(`${env.appUrl}/account/reset?token=${token}`), template: "password-reset" });
  }
  return { message: "If an account exists for that email, we've sent a link to reset your password. It expires in one hour." };
}

export async function resetPassword(_prev: State, form: FormData): Promise<State> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { error: "This reset link is invalid or has expired. Please request a new one." };
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await createSession(row.userId);
  redirect("/account?reset=1");
}

export async function updateProfile(_prev: State, form: FormData): Promise<State> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const current = String(form.get("currentPassword") ?? "");
  const next = String(form.get("newPassword") ?? "");
  const data: { name: string | null; passwordHash?: string } = { name: name || null };
  if (next) {
    const full = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!full.passwordHash || !(await verifyPassword(current, full.passwordHash))) return { error: "Your current password is incorrect." };
    const problem = passwordProblem(next);
    if (problem) return { error: problem };
    data.passwordHash = await hashPassword(next);
  }
  await prisma.user.update({ where: { id: user.id }, data });
  revalidatePath("/account");
  return { message: "Your details have been saved." };
}

/** Link a guest order (opened via its secure email link) to the signed-in account. */
export async function claimOrder(form: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  const orderId = String(form.get("orderId") ?? "");
  const token = String(form.get("token") ?? "");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId) redirect("/account");
  const access = await checkOrderAccess(order, token);
  if (access.ok && access.via !== "admin") {
    await prisma.order.update({ where: { id: order.id }, data: { userId: user.id } });
  }
  redirect(`/orders/${orderId}`);
}
