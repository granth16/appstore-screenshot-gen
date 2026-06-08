"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioDoc, Surface } from "@/domain/types";
import { DEFAULT_DOC } from "./seed";
import { readFile, readLocal, writeFile, writeLocal } from "./persistence";

// Session tuning knobs.
const HISTORY_CAP = 120; // most checkpoints we keep around
const MERGE_WINDOW_MS = 400; // edits closer than this fold into one checkpoint
const FLUSH_AFTER_MS = 750; // idle gap before an autosave fires

type Mutation = StudioDoc | ((current: StudioDoc) => StudioDoc);
const apply = (m: Mutation, current: StudioDoc): StudioDoc =>
  typeof m === "function" ? m(current) : m;

export function useStudioDoc() {
  const [doc, setDoc] = useState<StudioDoc>(DEFAULT_DOC);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // One timeline of checkpoints with a moving cursor: `timeline[cursor]` is
  // always the live document, so undo/redo is just sliding the cursor. `live`
  // mirrors the state so commits can read the current value synchronously.
  const timeline = useRef<StudioDoc[]>([DEFAULT_DOC]);
  const cursor = useRef(0);
  const live = useRef<StudioDoc>(DEFAULT_DOC);
  const lastEditAt = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publish = useCallback((next: StudioDoc) => {
    live.current = next;
    setDoc(next);
  }, []);

  // Seed from the cache for an instant first paint, then defer to the file.
  useEffect(() => {
    let stale = false;
    const cached = readLocal();
    if (cached) publish(cached);

    void (async () => {
      const onDisk = await readFile();
      if (stale) return;
      const start = onDisk ?? cached ?? DEFAULT_DOC;
      timeline.current = [start];
      cursor.current = 0;
      lastEditAt.current = 0;
      publish(start);
      setHydrated(true);
    })();

    return () => {
      stale = true;
    };
  }, [publish]);

  // Persist once the user pauses — cache first (must succeed), portable file next.
  useEffect(() => {
    if (!hydrated) return;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      const cache = writeLocal(doc);
      if (!cache.ok) {
        setSaveError(cache.error);
        return;
      }
      void writeFile(doc).then((disk) => {
        setSavedAt(Date.now());
        setSaveError(disk.ok ? null : `Couldn't write the project file: ${disk.error}`);
      });
    }, FLUSH_AFTER_MS);
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [doc, hydrated]);

  const commit = useCallback(
    (mutation: Mutation) => {
      const current = live.current;
      const next = apply(mutation, current);
      if (next === current) return;

      const now = Date.now();
      const sameBurst = now - lastEditAt.current <= MERGE_WINDOW_MS;
      lastEditAt.current = now;

      if (sameBurst && timeline.current.length > 0) {
        // Still the same burst of edits — overwrite the active checkpoint.
        timeline.current[cursor.current] = next;
      } else {
        // New checkpoint — discard any redo branch, append, advance the cursor.
        const kept = timeline.current.slice(0, cursor.current + 1);
        kept.push(next);
        if (kept.length > HISTORY_CAP) kept.shift();
        timeline.current = kept;
        cursor.current = kept.length - 1;
      }
      publish(next);
    },
    [publish],
  );

  const travel = useCallback(
    (delta: -1 | 1) => {
      const target = cursor.current + delta;
      if (target < 0 || target >= timeline.current.length) return;
      cursor.current = target;
      lastEditAt.current = 0; // any edit after a jump starts a fresh checkpoint
      publish(timeline.current[target]);
    },
    [publish],
  );

  const undo = useCallback(() => travel(-1), [travel]);
  const redo = useCallback(() => travel(1), [travel]);

  const resetAll = useCallback(() => commit(DEFAULT_DOC), [commit]);

  const resetSurface = useCallback(
    (surface: Surface) => {
      commit((current) => ({
        ...current,
        scenesBySurface: {
          ...current.scenesBySurface,
          [surface]: DEFAULT_DOC.scenesBySurface[surface],
        },
      }));
    },
    [commit],
  );

  return {
    doc,
    commit,
    hydrated,
    savedAt,
    saveError,
    resetAll,
    resetSurface,
    undo,
    redo,
  };
}
