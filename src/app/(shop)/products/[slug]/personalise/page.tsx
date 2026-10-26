import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCartId } from "@/lib/cart";
import { getProductBySlug, imageSrc, purchasableVariants } from "@/lib/catalog";
import { parsePersonalisation } from "@/lib/card/personalisation";
import { CardEditor } from "@/components/editor/CardEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return {
    title: product ? `Personalise ${product.title}` : "Personalise",
    robots: { index: false, follow: true },
    alternates: product ? { canonical: `/products/${product.slug}` } : undefined,
  };
}

export default async function PersonalisePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ item?: string }> }) {
  const { slug } = await params;
  const { item } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product || !product.template?.personalisable) notFound();
  const variant = purchasableVariants(product).find((v) => v.kind === "PERSONALISED");
  if (!variant) redirect(`/products/${slug}`);

  const t = product.template;
  let initial = null;
  let editItemId: string | null = null;
  if (item) {
    const cartId = await getCartId(false);
    const cartItem = cartId ? await prisma.cartItem.findFirst({ where: { id: item, cartId, productId: product.id } }) : null;
    if (cartItem?.personalisation) {
      const parsed = parsePersonalisation(cartItem.personalisation, t);
      if (parsed.ok) {
        initial = parsed.value;
        editItemId = cartItem.id;
      }
    }
  }

  const front = product.images.find((i) => i.role === "FRONT");
  const frontKey = t.frontPreviewKey ?? front?.key ?? null;
  return (
    <div className="container-page py-8 sm:py-10">
      <CardEditor
        productId={product.id}
        slug={product.slug}
        title={product.title}
        isVirtual={product.format === "VIRTUAL"}
        priceCents={variant.priceCents}
        template={{
          textX: t.textX,
          textY: t.textY,
          textWidth: t.textWidth,
          textHeight: t.textHeight,
          allowedFonts: t.allowedFonts,
          defaultFont: t.defaultFont,
          defaultFontSize: t.defaultFontSize,
          minFontSize: t.minFontSize,
          maxFontSize: t.maxFontSize,
          allowedColours: t.allowedColours,
          defaultColour: t.defaultColour,
          defaultAlign: t.defaultAlign,
        }}
        frontSrc={frontKey ? imageSrc(frontKey, "lg") : null}
        insideSrc={t.insidePreviewKey ? imageSrc(t.insidePreviewKey, "lg") : null}
        initial={initial}
        editItemId={editItemId}
      />
    </div>
  );
}
