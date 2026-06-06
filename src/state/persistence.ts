import { DOC_STORAGE_KEY } from "@/domain/settings";
import { COMPOSITION_NAME } from "@/domain/compositions";
import type { Composition, Scene, StudioDoc } from "@/domain/types";
import { normalizeCopy } from "@/text/copy";
import { DEFAULT_DOC } from "./seed";

export type SaveOutcome = { ok: true } | { ok: false; error: string };

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

// Maps slugs from earlier iterations onto the current vocabulary so previously
// saved projects keep rendering after a rename.
const COMPOSITION_ALIASES: Record<string, Composition> = {
  spotlight: "beacon",
  "anchored-base": "plinth",
  "anchored-crown": "canopy",
  "stacked-pair": "duet",
  "type-only": "manifesto",
  "side-by-side": "column",
  banner: "marquee",
};

function resolveComposition(value: unknown): Composition {
  if (typeof value === "string" && value in COMPOSITION_NAME) return value as Composition;
  if (typeof value === "string" && value in COMPOSITION_ALIASES) return COMPOSITION_ALIASES[value];
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

// Fill gaps from a partial (possibly older) document with current defaults and
// repair an out-of-range active locale.
export function hydrateDoc(partial: Partial<StudioDoc>): StudioDoc {
  const decks = partial.scenesBySurface
    ? Object.fromEntries(
        Object.entries(partial.scenesBySurface).map(([surface, scenes]) => [
          surface,
          (scenes || []).map(migrateScene),
        ]),
      )
    : {};

  const doc: StudioDoc = {
    ...DEFAULT_DOC,
    ...partial,
    scenesBySurface: {
      ...DEFAULT_DOC.scenesBySurface,
      ...decks,
    } as StudioDoc["scenesBySurface"],
  };

  if (!doc.locales || doc.locales.length === 0) {
    doc.locales = [...DEFAULT_DOC.locales];
  }
  if (!doc.locales.includes(doc.locale)) {
    doc.locale = doc.locales[0];
  }
  return doc;
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
