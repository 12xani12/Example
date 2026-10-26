import "server-only";
import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  if (!client) client = new Stripe(env.stripeSecretKey, { appInfo: { name: "Cardly" } });
  return client;
}
