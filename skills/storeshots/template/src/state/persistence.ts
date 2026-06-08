import { DOC_STORAGE_KEY } from "@/domain/settings";
import { COMPOSITION_NAME } from "@/domain/compositions";
import type { Composition, Scene, StudioDoc } from "@/domain/types";
import { normalizeCopy } from "@/text/copy";
import { DEFAULT_DOC } from "./seed";

export type SaveOutcome = { ok: true } | { ok: false; error: string };

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

function resolveComposition(value: unknown): Composition {
  if (typeof value === "string" && value in COMPOSITION_NAME) return value as Composition;
  return "plinth";
}

function migrateScene(scene: Scene): Scene {
  return {
    ...scene,
    composition: resolveComposition(scene.composition),
    label: normalizeCopy(scene.label as unknown),
    headline: normalizeCopy(scene.headline as unknown),
  };
}

// Reconcile a stored (possibly older) document with the current defaults. Every
// surface deck is run through scene migration, and the active locale is derived
// from whatever locale list actually survives — never trusted blindly.
export function hydrateDoc(partial: Partial<StudioDoc>): StudioDoc {
  const migratedDecks = Object.fromEntries(
    Object.entries(partial.scenesBySurface ?? {}).map(([surface, scenes]) => [
      surface,
      (scenes ?? []).map(migrateScene),
    ]),
  );

  const locales = partial.locales?.length ? partial.locales : [...DEFAULT_DOC.locales];
  const locale = partial.locale && locales.includes(partial.locale) ? partial.locale : locales[0];

  return {
    ...DEFAULT_DOC,
    ...partial,
    locale,
    locales,
    scenesBySurface: {
      ...DEFAULT_DOC.scenesBySurface,
      ...migratedDecks,
    } as StudioDoc["scenesBySurface"],
  };
}

export function readLocal(): StudioDoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DOC_STORAGE_KEY);
    if (!raw) return null;
    return hydrateDoc(JSON.parse(raw) as Partial<StudioDoc>);
  } catch {
    return null;
  }
}

export async function readFile(): Promise<StudioDoc | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/document", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { ok: boolean; doc: Partial<StudioDoc> | null };
    if (!json.ok || !json.doc) return null;
    return hydrateDoc(json.doc);
  } catch {
    return null;
  }
}

export function writeLocal(doc: StudioDoc): SaveOutcome {
  if (typeof window === "undefined") return { ok: true };
  try {
    window.localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(doc));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}

export async function writeFile(doc: StudioDoc): Promise<SaveOutcome> {
  if (typeof window === "undefined") return { ok: true };
  try {
    const res = await fetch("/api/document", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = (await res.json()) as { ok: boolean; error?: string };
    return json.ok ? { ok: true } : { ok: false, error: json.error || "Unknown error" };
  } catch (e) {
    return { ok: false, error: errorText(e) };
  }
}
