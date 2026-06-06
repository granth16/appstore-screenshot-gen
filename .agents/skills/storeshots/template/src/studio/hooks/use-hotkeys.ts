"use client";
import * as React from "react";
import type { Scene } from "@/domain/types";

type HotkeyConfig = {
  // Disabled while an export is running.
  enabled: boolean;
  scenes: Scene[];
  activeId: string | null;
  select: (id: string) => void;
  deselect: () => void;
  undo: () => void;
  redo: () => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
};

const isTypingTarget = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null;
  return (
    !!node &&
    (node.tagName === "INPUT" ||
      node.tagName === "TEXTAREA" ||
      node.isContentEditable)
  );
};

// Global keyboard shortcuts for the studio: undo/redo, escape-to-deselect,
// arrow/j/k scene navigation, and cmd-D / cmd-Backspace.
export function useStudioHotkeys(config: HotkeyConfig) {
  // Keep a live ref so the listener doesn't need re-binding on every change.
  const ref = React.useRef(config);
  ref.current = config;

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const c = ref.current;
      if (!c.enabled) return;
      const mod = e.metaKey || e.ctrlKey;
      const typing = isTypingTarget(e.target);

      // Undo/redo + escape work everywhere, including inside text fields.
      if (mod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) c.redo();
        else c.undo();
        return;
      }
      if (mod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        c.redo();
        return;
      }
      if (e.key === "Escape") {
        c.deselect();
        const t = e.target as HTMLElement | null;
        if (t && typeof t.blur === "function") t.blur();
        return;
      }

      if (typing || !c.scenes.length) return;

      const index = c.activeId ? c.scenes.findIndex((s) => s.id === c.activeId) : -1;

      if (e.key === "ArrowDown" || (e.key === "j" && !mod)) {
        e.preventDefault();
        const next = c.scenes[Math.min(c.scenes.length - 1, index + 1)];
        if (next) c.select(next.id);
      } else if (e.key === "ArrowUp" || (e.key === "k" && !mod)) {
        e.preventDefault();
        const prev = c.scenes[Math.max(0, index - 1)];
        if (prev) c.select(prev.id);
      } else if (mod && (e.key === "d" || e.key === "D")) {
        if (c.activeId) {
          e.preventDefault();
          c.duplicate(c.activeId);
        }
      } else if (mod && (e.key === "Backspace" || e.key === "Delete")) {
        if (c.activeId) {
          e.preventDefault();
          c.remove(c.activeId);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
