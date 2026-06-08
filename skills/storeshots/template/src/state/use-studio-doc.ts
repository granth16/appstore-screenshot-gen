"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioDoc, Surface } from "@/domain/types";
import { DEFAULT_DOC } from "./seed";
import {
  readFile,
  readLocal,
  writeFile,
  writeLocal,
} from "./persistence";

const MAX_HISTORY = 50;
// Rapid edits (typing, dragging a slider) within this window collapse into one
// undo step.
const COALESCE_WINDOW_MS = 500;
// How long to wait after the last edit before persisting.
const PERSIST_DELAY_MS = 600;

type Mutation = StudioDoc | ((current: StudioDoc) => StudioDoc);

const resolveMutation = (m: Mutation, current: StudioDoc): StudioDoc =>
  typeof m === "function" ? m(current) : m;

export function useStudioDoc() {
  const [doc, setDoc] = useState<StudioDoc>(DEFAULT_DOC);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo/redo stacks live in refs — they never drive a render directly.
  const undoStack = useRef<StudioDoc[]>([]);
  const redoStack = useRef<StudioDoc[]>([]);
  const lastCommitAt = useRef(0);

  // Hydrate: localStorage first for instant paint, then the on-disk file wins.
  useEffect(() => {
    let abandoned = false;
    const cached = readLocal();
    if (cached) setDoc(cached);

    void (async () => {
      const fromDisk = await readFile();
      if (abandoned) return;
      if (fromDisk) setDoc(fromDisk);
      undoStack.current = [];
      redoStack.current = [];
      lastCommitAt.current = 0;
      setHydrated(true);
    })();

    return () => {
      abandoned = true;
    };
  }, []);

  // Debounced autosave to both localStorage (fast) and the file (portable).
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const local = writeLocal(doc);
      void writeFile(doc).then((file) => {
        if (file.ok && local.ok) {
          setSavedAt(Date.now());
          setSaveError(null);
        } else if (!file.ok && !local.ok) {
          setSaveError(file.error);
        } else if (!file.ok) {
          setSavedAt(Date.now());
          setSaveError(`File save failed: ${file.error}`);
        } else {
          setSavedAt(Date.now());
          setSaveError(local.ok ? null : local.error);
        }
      });
    }, PERSIST_DELAY_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [doc, hydrated]);

  const commit = useCallback((mutation: Mutation) => {
    setDoc((current) => {
      const next = resolveMutation(mutation, current);
      if (next === current) return current;
      const now = Date.now();
      if (now - lastCommitAt.current > COALESCE_WINDOW_MS) {
        undoStack.current.push(current);
        if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
        redoStack.current.length = 0;
      }
      lastCommitAt.current = now;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setDoc((current) => {
      const prev = undoStack.current.pop();
      if (prev === undefined) return current;
      redoStack.current.push(current);
      lastCommitAt.current = 0;
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setDoc((current) => {
      const next = redoStack.current.pop();
      if (next === undefined) return current;
      undoStack.current.push(current);
      lastCommitAt.current = 0;
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    commit(DEFAULT_DOC);
  }, [commit]);

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
