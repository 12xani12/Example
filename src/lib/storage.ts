import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { env } from "./env";

/**
 * Object storage for images and paid files.
 * Keys under "public/" may be served by /api/media; everything under
 * "private/" is only ever streamed after a server-side entitlement check.
 */
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

function assertSafeKey(key: string) {
  if (!/^(public|private)\/[A-Za-z0-9/_\-.]+$/.test(key) || key.includes("..")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}

class LocalStorage implements Storage {
  constructor(private root: string) {}
  private resolve(key: string) {
    assertSafeKey(key);
    return path.join(path.resolve(this.root), key);
  }
  async put(key: string, body: Buffer) {
    const file = this.resolve(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
  }
  async get(key: string) {
    try {
      return await fs.readFile(this.resolve(key));
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    await fs.rm(this.resolve(key), { force: true });
  }
}

class S3Storage implements Storage {
  private clientPromise = (async () => {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      region: env.s3.region,
      endpoint: env.s3.endpoint,
      forcePathStyle: env.s3.forcePathStyle,
      credentials:
        env.s3.accessKeyId && env.s3.secretAccessKey
          ? { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey }
          : undefined,
    });
  })();

  private get bucket() {
    if (!env.s3.bucket) throw new Error("S3_BUCKET is not configured.");
    return env.s3.bucket;
  }

  async put(key: string, body: Buffer, contentType: string) {
    assertSafeKey(key);
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.clientPromise;
    await client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
  }

  async get(key: string) {
    assertSafeKey(key);
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.clientPromise;
    try {
      const res = await client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!res.Body) return null;
      return Buffer.from(await res.Body.transformToByteArray());
    } catch (err) {
      if ((err as { name?: string }).name === "NoSuchKey") return null;
      throw err;
    }
  }

  async delete(key: string) {
    assertSafeKey(key);
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.clientPromise;
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

let instance: Storage | null = null;

export function storage(): Storage {
  if (!instance) {
    if (env.isProduction && env.storageDriver === "local" && process.env.VERCEL) {
      console.error("[storage] STORAGE_DRIVER=local on a serverless host loses files between requests. Configure S3-compatible storage.");
    }
    instance = env.storageDriver === "s3" ? new S3Storage() : new LocalStorage(env.storageLocalDir);
  }
  return instance;
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return `/api/media/${key.replace(/^public\//, "")}`;
}
