import "server-only";
import { Prisma, type ProductType, type VariantKind } from "@prisma/client";
import { prisma } from "./db";
import { env, mockPaymentsEnabled, stripeIsTestMode } from "./env";
import { mediaUrl } from "./storage";

export const PAGE_SIZE = 12;

export const productInclude = {
  variants: true,
  images: { orderBy: { sortOrder: "asc" } },
  categories: { include: { category: true } },
  template: true,
  files: { select: { id: true, variantKind: true, filename: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  type: ProductType;
  format: "PRINTABLE" | "VIRTUAL";
  image: { src: string; srcLg: string; alt: string } | null;
  readyMadeCents: number | null;
  personalisedCents: number | null;
  fromCents: number;
  personalisable: boolean;
  isNew: boolean;
  isDemo: boolean;
};

/** Demo products only become purchasable in test/simulated payment mode when explicitly allowed. */
export function demoPurchasesAllowed() {
  return env.allowDemoPurchases && (mockPaymentsEnabled() || stripeIsTestMode());
}

export function variantHasDeliverable(product: ProductWithRelations, kind: VariantKind) {
  const t = product.template;
  if (kind === "PERSONALISED") return !!t && t.personalisable && !!t.frontArtKey;
  const uploaded = product.files.some((f) => f.variantKind === null || f.variantKind === "READY_MADE");
  return uploaded || (!!t && !!t.frontArtKey);
}

export function purchasableVariants(product: ProductWithRelations) {
  if (product.status !== "PUBLISHED") return [];
  if (product.isDemo && !demoPurchasesAllowed()) return [];
  return product.variants.filter((v) => v.active && variantHasDeliverable(product, v.kind));
}

export function imageSrc(key: string, size: "sm" | "lg") {
  return mediaUrl(`${key}-${size}.webp`)!;
}

export function frontImage(product: Pick<ProductWithRelations, "images" | "title">) {
  const img = product.images.find((i) => i.role === "FRONT") ?? product.images[0];
  if (!img) return null;
  return { src: imageSrc(img.key, "sm"), srcLg: imageSrc(img.key, "lg"), alt: img.alt || product.title };
}

export function toCardData(p: ProductWithRelations): ProductCardData {
  const active = p.variants.filter((v) => v.active);
  const ready = active.find((v) => v.kind === "READY_MADE");
  const pers = active.find((v) => v.kind === "PERSONALISED");
  const prices = active.map((v) => v.priceCents);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    type: p.type,
    format: p.format,
    image: frontImage(p),
    readyMadeCents: ready?.priceCents ?? null,
    personalisedCents: pers?.priceCents ?? null,
    fromCents: prices.length ? Math.min(...prices) : 0,
    personalisable: !!pers && !!p.template?.personalisable,
    isNew: p.isNewArrival,
    isDemo: p.isDemo,
  };
}

export type ShopQuery = {
  q?: string;
  category?: string;
  type?: string;
  option?: string;
  format?: string;
  min?: string;
  max?: string;
  new?: string;
  sort?: string;
  page?: string;
};

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
] as const;

export async function bestSellerCounts(): Promise<Map<string, number>> {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { in: ["PAID", "PARTIALLY_REFUNDED"] } }, productId: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.productId!, r._count._all]));
}

export async function searchProducts(query: ShopQuery, extraWhere: Prisma.ProductWhereInput = {}) {
  const and: Prisma.ProductWhereInput[] = [{ status: "PUBLISHED" }, extraWhere];

  const words = (query.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
  for (const w of words) {
    and.push({
      OR: [
        { title: { contains: w, mode: "insensitive" } },
        { shortDescription: { contains: w, mode: "insensitive" } },
        { description: { contains: w, mode: "insensitive" } },
        { tags: { has: w } },
        { categories: { some: { category: { name: { contains: w, mode: "insensitive" }, isHidden: false } } } },
      ],
    });
  }
  if (query.category) and.push({ categories: { some: { category: { slug: query.category } } } });
  if (query.type) and.push({ type: query.type as ProductType });
  if (query.format === "printable") and.push({ format: "PRINTABLE" });
  if (query.format === "virtual") and.push({ format: "VIRTUAL" });
  if (query.option === "personalised") and.push({ variants: { some: { kind: "PERSONALISED", active: true } }, template: { personalisable: true } });
  if (query.option === "ready-made") and.push({ variants: { some: { kind: "READY_MADE", active: true } } });
  if (query.new === "1") and.push({ isNewArrival: true });
  const min = query.min ? Math.round(Number(query.min) * 100) : NaN;
  const max = query.max ? Math.round(Number(query.max) * 100) : NaN;
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    and.push({
      variants: {
        some: {
          active: true,
          priceCents: { ...(Number.isNaN(min) ? {} : { gte: min }), ...(Number.isNaN(max) ? {} : { lte: max }) },
        },
      },
    });
  }

  const products = await prisma.product.findMany({ where: { AND: and }, include: productInclude });
  const cards = products.map((p) => ({ card: toCardData(p), p }));

  const sort = query.sort ?? "featured";
  if (sort === "newest") cards.sort((a, b) => +b.p.createdAt - +a.p.createdAt);
  else if (sort === "price-asc") cards.sort((a, b) => a.card.fromCents - b.card.fromCents);
  else if (sort === "price-desc") cards.sort((a, b) => b.card.fromCents - a.card.fromCents);
  else if (sort === "best-selling") {
    const counts = await bestSellerCounts();
    cards.sort((a, b) => (counts.get(b.p.id) ?? 0) - (counts.get(a.p.id) ?? 0) || a.p.sortOrder - b.p.sortOrder);
  } else {
    cards.sort((a, b) => Number(b.p.isFeatured) - Number(a.p.isFeatured) || a.p.sortOrder - b.p.sortOrder || +b.p.createdAt - +a.p.createdAt);
  }

  const total = cards.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(query.page) || 1), pages);
  return {
    total,
    page,
    pages,
    items: cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => c.card),
  };
}

export async function getVisibleCategories() {
  return prisma.category.findMany({ where: { isHidden: false }, orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { name: "asc" }] });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: productInclude });
}

export async function relatedProducts(product: ProductWithRelations, limit = 4) {
  const categoryIds = product.categories.map((c) => c.categoryId);
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED", id: { not: product.id }, categories: { some: { categoryId: { in: categoryIds } } } },
    include: productInclude,
    take: limit * 2,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  });
  let list = rows;
  if (list.length < limit) {
    const extra = await prisma.product.findMany({
      where: { status: "PUBLISHED", id: { notIn: [product.id, ...list.map((r) => r.id)] }, type: product.type },
      include: productInclude,
      take: limit,
    });
    list = [...list, ...extra];
  }
  return list.slice(0, limit).map(toCardData);
}
