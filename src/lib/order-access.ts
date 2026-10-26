import "server-only";
import { cookies } from "next/headers";
import { env } from "./env";
import { hmac, safeEqual } from "./crypto";
import { getCurrentUser } from "./auth";
import { getDownloadSettings } from "./settings";

const GRANT_COOKIE = "cardly_orders";

/**
 * Guest access tokens are signed, self-expiring values ("<expiry>.<signature>")
 * so every emailed link stays valid for its own lifetime.
 */
export async function issueAccessToken(orderId: string) {
  const { accessLinkDays } = await getDownloadSettings();
  const exp = Math.floor(Date.now() / 1000) + accessLinkDays * 86400;
  return `${exp}.${hmac(`order:${orderId}:${exp}`)}`;
}

export function verifyAccessToken(orderId: string, token: string): "valid" | "expired" | "invalid" {
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return "invalid";
  if (!safeEqual(sig, hmac(`order:${orderId}:${exp}`))) return "invalid";
  return Number(exp) < Math.floor(Date.now() / 1000) ? "expired" : "valid";
}

export function orderUrl(orderId: string, token?: string) {
  return `${env.appUrl}/orders/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
}

/** Remember orders placed in this browser so the success page can show downloads without email. */
export async function grantOrderInBrowser(orderId: string) {
  const jar = await cookies();
  const existing = (jar.get(GRANT_COOKIE)?.value ?? "").split(".").filter(Boolean);
  const entries = existing.filter((e) => verifyGrant(e) && !e.startsWith(`${orderId}~`)).slice(-9);
  const exp = Date.now() + 7 * 86400_000;
  const payload = `${orderId}~${exp}`;
  entries.push(`${payload}~${hmac(`grant:${payload}`)}`);
  jar.set(GRANT_COOKIE, entries.join("."), { httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
}

function verifyGrant(entry: string): string | null {
  const [orderId, exp, sig] = entry.split("~");
  if (!orderId || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;
  return safeEqual(sig, hmac(`grant:${orderId}~${exp}`)) ? orderId : null;
}

export type AccessResult = { ok: true; via: "user" | "token" | "browser" | "admin" } | { ok: false; reason: "expired" | "denied" };

/** Server-side authorisation for viewing an order and its downloads. */
export async function checkOrderAccess(order: { id: string; userId: string | null; email: string }, token?: string | null): Promise<AccessResult> {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") return { ok: true, via: "admin" };
  // Only orders explicitly linked to the account. Matching on email alone would let
  // someone register with another person's address and see their purchases.
  if (user && order.userId === user.id) return { ok: true, via: "user" };
  const tokenState = token ? verifyAccessToken(order.id, token) : "invalid";
  if (tokenState === "valid") return { ok: true, via: "token" };
  const grants = ((await cookies()).get(GRANT_COOKIE)?.value ?? "").split(".").map(verifyGrant);
  if (grants.includes(order.id)) return { ok: true, via: "browser" };
  return { ok: false, reason: tokenState === "expired" ? "expired" : "denied" };
}

/** Short-lived signed download URL. Access was already checked when the URL was minted. */
export function signedDownloadUrl(entitlementId: string, ttlSeconds = 15 * 60) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = hmac(`dl:${entitlementId}:${exp}`);
  return `/api/downloads/${entitlementId}?exp=${exp}&sig=${sig}`;
}

export function verifyDownloadSignature(entitlementId: string, exp: string | null, sig: string | null) {
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, hmac(`dl:${entitlementId}:${exp}`));
}
