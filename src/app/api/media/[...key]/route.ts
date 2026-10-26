import { storage } from "@/lib/storage";

const TYPES: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };

/** Serves public images only. Paid files live under private/ and are never reachable here. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.join("/");
  if (!/^[A-Za-z0-9/_\-.]+$/.test(path) || path.includes("..")) return new Response("Not found", { status: 404 });
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type || ext === "svg") return new Response("Not found", { status: 404 });
  const body = await storage().get(`public/${path}`);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": type,
      // Keys contain a random UUID, so content at a key never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
