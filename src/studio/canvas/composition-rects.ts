import type { Composition, ElementKey, Scene } from "@/domain/types";
import type { CompositionRects, PlacementRect } from "./editing";

// Default placement for each composition's elements, in canvas pixels. The
// device width fractions are supplied by the caller (they depend on the
// surface + orientation).
export function templateRects(
  composition: Composition,
  canvasW: number,
  canvasH: number,
  frameAspect: number,
  widthFrac: number,
  smallWidthFrac: number,
): CompositionRects {
  const deviceW = widthFrac * canvasW;
  const deviceH = deviceW / frameAspect;
  const echoW = smallWidthFrac * canvasW;
  const echoH = echoW / frameAspect;
  const copyW = canvasW * 0.84;
  const copyH = canvasH * 0.28;
  const centeredX = (canvasW - deviceW) / 2;

  switch (composition) {
    case "spotlight":
      return {
        copy: { x: canvasW * 0.08, y: canvasH * 0.09, width: copyW, height: copyH, align: "center" },
        screen: { x: centeredX, y: canvasH - deviceH + deviceH * 0.15, width: deviceW, height: deviceH },
      };
    case "anchored-base":
      return {
        copy: { x: canvasW * 0.08, y: canvasH * 0.08, width: copyW, height: copyH, align: "center" },
        screen: { x: centeredX, y: canvasH - deviceH - canvasH * 0.02, width: deviceW, height: deviceH },
      };
    case "anchored-crown":
      return {
        copy: { x: canvasW * 0.08, y: canvasH * 0.65, width: copyW, height: copyH, align: "center" },
        screen: { x: centeredX, y: -canvasH * 0.1, width: deviceW, height: deviceH },
      };
    case "stacked-pair":
      return {
        copy: { x: canvasW * 0.08, y: canvasH * 0.08, width: copyW, height: copyH, align: "center" },
        screenEcho: {
          x: -canvasW * 0.06,
          y: canvasH - echoH - canvasH * 0.05,
          width: echoW,
          height: echoH,
        },
        screen: {
          x: canvasW - deviceW * 0.9 + canvasW * 0.06,
          y: canvasH - deviceH * 0.9 - canvasH * 0.02,
          width: deviceW * 0.9,
          height: (deviceW * 0.9) / frameAspect,
        },
      };
    case "type-only":
      return {
        copy: { x: canvasW * 0.1, y: canvasH * 0.35, width: canvasW * 0.8, height: canvasH * 0.3, align: "center" },
      };
    case "side-by-side":
      return {
        copy: { x: canvasW * 0.05, y: canvasH * 0.25, width: canvasW * 0.38, height: canvasH * 0.5, align: "left" },
        screen: { x: canvasW - deviceW + canvasW * 0.03, y: (canvasH - deviceH) / 2, width: deviceW, height: deviceH },
      };
    default:
      return {};
  }
}

// Resolve the effective rect for an element: a user override wins, but inherits
// the default's text alignment.
export function boxFor(
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

// Default stacking order when a scene hasn't customised zIndex.
export function defaultZ(key: ElementKey): number {
  if (key === "screenEcho") return 2;
  if (key === "screen") return 3;
  return 4; // copy on top
}
