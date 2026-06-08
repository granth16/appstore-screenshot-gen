import { promises as fs } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { DOC_FILE_NAME } from "@/domain/settings";

export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

function docPath() {
  return join(process.cwd(), DOC_FILE_NAME);
}

function ok(payload: JsonObject = {}) {
  return NextResponse.json({ ok: true, ...payload });
}

function err(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function isMissingFile(e: unknown) {
  return (e as NodeJS.ErrnoException | null)?.code === "ENOENT";
}

const message = (e: unknown, fallback: string) =>
  e instanceof Error ? e.message : fallback;

// GET /api/document
// Returns the saved studio document. A project that has never been saved simply
// has no file yet, which we report as `doc: null` rather than an error.
export async function GET() {
  try {
    const contents = await fs.readFile(docPath(), "utf8");
    return ok({ doc: JSON.parse(contents) });
  } catch (e) {
    if (isMissingFile(e)) return ok({ doc: null });
    return err(message(e, "Could not read the document"));
  }
}

// POST /api/document
// Overwrites the saved document. The body has to be a JSON object; it is written
// with two-space indentation (and a trailing newline) so the file stays
// diff-friendly when committed.
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return err("Request body was not valid JSON", 400);
  }

  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return err("Expected a JSON object", 422);
  }

  try {
    const text = JSON.stringify(payload, null, 2);
    await fs.writeFile(docPath(), text.endsWith("\n") ? text : `${text}\n`, "utf8");
    return ok();
  } catch (e) {
    return err(message(e, "Could not write the document"));
  }
}
