import type { Composition, ElementKey, Scene } from "@/domain/types";
import type { CompositionRects, PlacementRect } from "./editing";

// ---------------------------------------------------------------------------
// Layouts are declared as fractions of the canvas, then resolved to pixels.
//
// Text slots are given as a box (left/top/width/height as 0..1 fractions).
// Device slots are given by a CENTRE point + a target height fraction; the
// width is derived from the device aspect, so devices may bleed off-canvas.
// This anchor-by-centre approach (rather than top-left pixel rects) keeps the
// declarations compact and lets devices sit half-off an edge cleanly.
// ---------------------------------------------------------------------------

type TextSlot = { x: number; y: number; w: number; h: number; align: "center" | "left" };
type DeviceSlot = { cx: number; cy: number; heightFrac: number };

type Blueprint = {
  copy?: TextSlot;
  screen?: DeviceSlot;
  screenEcho?: DeviceSlot;
};

const BLUEPRINTS: Record<Composition, Blueprint> = {
  beacon: {
    copy: { x: 0.08, y: 0.07, w: 0.84, h: 0.26, align: "center" },
    screen: { cx: 0.5, cy: 0.74, heightFrac: 0.62 },
  },
  plinth: {
    copy: { x: 0.08, y: 0.06, w: 0.84, h: 0.24, align: "center" },
    screen: { cx: 0.5, cy: 0.73, heightFrac: 0.66 },
  },
  canopy: {
    screen: { cx: 0.5, cy: 0.27, heightFrac: 0.6 },
    copy: { x: 0.08, y: 0.62, w: 0.84, h: 0.3, align: "center" },
  },
  duet: {
    copy: { x: 0.08, y: 0.06, w: 0.84, h: 0.22, align: "center" },
    screenEcho: { cx: 0.31, cy: 0.72, heightFrac: 0.5 },
    screen: { cx: 0.66, cy: 0.74, heightFrac: 0.56 },
  },
  manifesto: {
    copy: { x: 0.1, y: 0.33, w: 0.8, h: 0.34, align: "center" },
  },
  column: {
    copy: { x: 0.06, y: 0.26, w: 0.4, h: 0.48, align: "left" },
    screen: { cx: 0.74, cy: 0.5, heightFrac: 0.82 },
  },
  marquee: {},
};

function textRect(slot: TextSlot, cw: number, ch: number): PlacementRect {
  return { x: slot.x * cw, y: slot.y * ch, width: slot.w * cw, height: slot.h * ch, align: slot.align };
}

function deviceRect(slot: DeviceSlot, cw: number, ch: number, aspect: number): PlacementRect {
  const height = slot.heightFrac * ch;
  const width = height * aspect;
  return {
    x: slot.cx * cw - width / 2,
    y: slot.cy * ch - height / 2,
    width,
    height,
  };
}

// Resolve a composition's default element rects in canvas pixels.
export function resolveLayout(
  composition: Composition,
  canvasW: number,
  canvasH: number,
  deviceAspect: number,
): CompositionRects {
  const bp = BLUEPRINTS[composition] ?? BLUEPRINTS.plinth;
  const out: CompositionRects = {};
  if (bp.copy) out.copy = textRect(bp.copy, canvasW, canvasH);
  if (bp.screen) out.screen = deviceRect(bp.screen, canvasW, canvasH, deviceAspect);
  if (bp.screenEcho) out.screenEcho = deviceRect(bp.screenEcho, canvasW, canvasH, deviceAspect);
  return out;
}

// A user override replaces the default rect but keeps its text alignment.
export function resolveBox(
  key: ElementKey,
  scene: Scene,
  defaults: CompositionRects,
): PlacementRect | undefined {
  const override = scene.boxes?.[key];
  const fallback = defaults[key];
  if (!override && !fallback) return undefined;
  if (!override) return fallback;
  return {
    x: override.x,
    y: override.y,
    width: override.width,
    height: override.height,
    align: fallback?.align,
  };
}

// Base stacking order before any user restacking.
export function baseLayer(key: ElementKey): number {
  if (key === "screenEcho") return 2;
  if (key === "screen") return 3;
  return 4; // copy sits on top
}
