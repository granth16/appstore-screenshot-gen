import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join("public", "captures", "uploads");
const PUBLIC_PREFIX = "/captures/uploads";
const MAX_BYTES = 8 * 1024 * 1024;

const EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

function decodeDataUri(dataUri: string): { mime: string; bytes: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUri);
  if (!match) return null;
  return { mime: match[1].toLowerCase(), bytes: Buffer.from(match[2], "base64") };
}

// Accept a base64 data URI, content-address it, and write it under
// public/captures/uploads so the capture survives a clone.
export async function POST(req: Request) {
  let body: { dataUri?: string };
  try {
    body = (await req.json()) as { dataUri?: string };
  } catch {
    return fail("Invalid JSON");
  }
  if (!body?.dataUri || typeof body.dataUri !== "string") {
    return fail("Missing dataUri");
  }

  const decoded = decodeDataUri(body.dataUri);
  if (!decoded) return fail("Unsupported data URI");

  const ext = EXTENSION[decoded.mime];
  if (!ext) return fail(`Unsupported mime: ${decoded.mime}`);
  if (decoded.bytes.byteLength > MAX_BYTES) return fail("Image too large (>8MB)", 413);

  const hash = createHash("sha1").update(decoded.bytes).digest("hex").slice(0, 16);
  const filename = `${hash}.${ext}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR);
  const file = path.join(dir, filename);

  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, decoded.bytes);
    }
    return NextResponse.json({ ok: true, path: `${PUBLIC_PREFIX}/${filename}` });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e), 500);
  }
}
