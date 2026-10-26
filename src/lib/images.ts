import "server-only";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { storage } from "./storage";

export const IMAGE_SIZES = { sm: 600, lg: 1400 } as const;

/** Store web renditions of an image. Returns the key prefix used by <ProductImage>. */
export async function storePublicImage(input: Buffer, folder: string) {
  const base = `public/${folder}/${randomUUID()}`;
  const img = sharp(input, { failOn: "error" }).rotate();
  const meta = await img.metadata();
  for (const [name, width] of Object.entries(IMAGE_SIZES)) {
    const out = await img.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    await storage().put(`${base}-${name}.webp`, out, "image/webp");
  }
  return { key: base, width: meta.width ?? 0, height: meta.height ?? 0 };
}

export async function deletePublicImage(base: string) {
  await Promise.all(Object.keys(IMAGE_SIZES).map((n) => storage().delete(`${base}-${n}.webp`)));
}

/** Store a private, print-resolution artwork file (normalised to PNG). */
export async function storePrivateArtwork(input: Buffer, folder: string) {
  const key = `private/${folder}/${randomUUID()}.png`;
  const png = await sharp(input, { failOn: "error" }).rotate().png().toBuffer();
  await storage().put(key, png, "image/png");
  return key;
}
