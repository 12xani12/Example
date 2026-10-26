// Server-only configuration. Never import this from client components.
import "server-only";

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export const env = {
  appUrl: (optional("APP_URL") ?? "http://localhost:3000").replace(/\/$/, ""),
  authSecret: optional("AUTH_SECRET") ?? "",
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  storageDriver: (optional("STORAGE_DRIVER") ?? "local") as "local" | "s3",
  storageLocalDir: optional("STORAGE_LOCAL_DIR") ?? "./storage",
  s3: {
    endpoint: optional("S3_ENDPOINT"),
    region: optional("S3_REGION") ?? "auto",
    bucket: optional("S3_BUCKET"),
    accessKeyId: optional("S3_ACCESS_KEY_ID"),
    secretAccessKey: optional("S3_SECRET_ACCESS_KEY"),
    forcePathStyle: optional("S3_FORCE_PATH_STYLE") === "true",
  },
  smtp: {
    host: optional("SMTP_HOST"),
    port: Number(optional("SMTP_PORT") ?? 587),
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
    secure: optional("SMTP_SECURE") === "true",
  },
  emailFrom: optional("EMAIL_FROM") ?? "Cardly <hello@example.com>",
  allowDemoPurchases: optional("ALLOW_DEMO_PURCHASES") === "true",
  isProduction: process.env.NODE_ENV === "production",
};

export function assertAuthSecret(): string {
  if (env.authSecret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return env.authSecret;
}

/** Stripe test-mode keys start with sk_test_ / rk_test_. */
export function stripeIsTestMode(): boolean {
  return !!env.stripeSecretKey && /^(sk|rk)_test_/.test(env.stripeSecretKey);
}

/**
 * The simulated payment provider exists only so the full purchase flow can be
 * exercised locally without Stripe keys. It can never run in production.
 */
export function mockPaymentsEnabled(): boolean {
  return !env.isProduction && !env.stripeSecretKey;
}
