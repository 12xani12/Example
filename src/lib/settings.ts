import "server-only";
import { cache } from "react";
import { prisma } from "./db";

/**
 * GST handling:
 *  - NOT_REGISTERED: no GST is charged; customers receive a receipt (not a tax invoice).
 *  - INCLUSIVE: listed prices include GST; GST component is shown on the tax invoice.
 *  - EXCLUSIVE: GST is added on top of listed prices at checkout.
 */
export type { GstMode } from "./pricing";
import type { GstMode } from "./pricing";

export type BusinessSettings = {
  businessName: string;
  abn: string;
  supportEmail: string;
  gstMode: GstMode;
  gstRatePercent: number;
  instagramUrl: string;
  pinterestUrl: string;
  facebookUrl: string;
};

export type DownloadSettings = {
  /** How long the guest purchase link emailed to customers stays valid. */
  accessLinkDays: number;
  /** Optional cap on downloads per file. 0 = unlimited. */
  maxDownloadsPerFile: number;
};

export type HomepageSettings = {
  heroHeading: string;
  heroText: string;
  heroButtonLabel: string;
  heroButtonHref: string;
  heroImageKey: string | null;
  announcement: string;
  promoHeading: string;
  promoText: string;
  promoButtonLabel: string;
  promoButtonHref: string;
  promoImageKey: string | null;
  seasonalHeading: string;
  seasonalText: string;
  seasonalCategorySlug: string;
  featuredHeading: string;
  moreHeading: string;
  moreText: string;
};

export const DEFAULT_BUSINESS: BusinessSettings = {
  businessName: "Cardly",
  abn: "",
  supportEmail: "hello@example.com",
  gstMode: "NOT_REGISTERED",
  gstRatePercent: 10,
  instagramUrl: "",
  pinterestUrl: "",
  facebookUrl: "",
};

export const DEFAULT_DOWNLOADS: DownloadSettings = {
  accessLinkDays: 30,
  maxDownloadsPerFile: 0,
};

export const DEFAULT_HOMEPAGE: HomepageSettings = {
  heroHeading: "Printable Cards For Every Occasion",
  heroText: "Beautiful, affordable and easy-to-download cards to make every moment special.",
  heroButtonLabel: "Shop all cards",
  heroButtonHref: "/shop",
  heroImageKey: null,
  announcement: "Instant digital downloads · Prices in AUD · Nothing to ship",
  promoHeading: "Small Cards. Big Moments.",
  promoText: "Thoughtful printable and virtual cards, ready in minutes.",
  promoButtonLabel: "Shop now",
  promoButtonHref: "/shop",
  promoImageKey: null,
  seasonalHeading: "",
  seasonalText: "",
  seasonalCategorySlug: "",
  featuredHeading: "Our Best-Loved Designs",
  moreHeading: "More Than Just Cards",
  moreText:
    "Explore a beautiful collection of printable downloads designed to make everyday life easier and life's special moments even more memorable.",
};

async function read<T extends object>(key: string, defaults: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return { ...defaults, ...((row?.value as Partial<T>) ?? {}) };
}

export const getBusinessSettings = cache(() => read("business", DEFAULT_BUSINESS));
export const getDownloadSettings = cache(() => read("downloads", DEFAULT_DOWNLOADS));
export const getHomepageSettings = cache(() => read("homepage", DEFAULT_HOMEPAGE));

export async function saveSetting(key: "business" | "downloads" | "homepage", value: object) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  });
}
