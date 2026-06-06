import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { DOC_FILE_NAME } from "@/domain/settings";

export const dynamic = "force-dynamic";

const docPath = () => path.join(process.cwd(), DOC_FILE_NAME);

const fail = (error: string, status = 500) => NextResponse.json({ ok: false, error }, { status });

// Read the persisted studio document. A missing file is not an error — the
// client falls back to its seed.
export async function GET() {
  try {
    const raw = await fs.readFile(docPath(), "utf8");
    return NextResponse.json({ ok: true, doc: JSON.parse(raw) });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ ok: true, doc: null });
    }
    return fail(e instanceof Error ? e.message : String(e));
  }
}

// Persist the document, pretty-printed so it stays diff-friendly in git.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  try {
    await fs.writeFile(docPath(), `${JSON.stringify(body, null, 2)}\n`, "utf8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
