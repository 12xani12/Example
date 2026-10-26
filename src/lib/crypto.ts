import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { assertAuthSecret } from "./env";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hmac(input: string): string {
  return createHmac("sha256", assertAuthSecret()).update(input).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
