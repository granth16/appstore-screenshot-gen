import type { StageOrientation, Store, Surface } from "./types";

// Canvas geometry. We author every surface at its largest required pixel size
// and downscale on export.
type CanvasGeometry = { w: number; h: number; landscapeW?: number; landscapeH?: number };

export const CANVAS_GEOMETRY: Record<Surface, CanvasGeometry> = {
  "ios-phone": { w: 1320, h: 2868 },
  "ios-tablet": { w: 2064, h: 2752 },
  "play-phone": { w: 1080, h: 1920 },
  "play-tablet-7": { w: 1200, h: 1920, landscapeW: 1920, landscapeH: 1200 },
  "play-tablet-10": { w: 1600, h: 2560, landscapeW: 2560, landscapeH: 1600 },
  "play-banner": { w: 1024, h: 500 },
};

export type OutputSize = { label: string; w: number; h: number };

// Portrait export sizes required by each store, per surface.
const PORTRAIT_SIZES: Record<Surface, OutputSize[]> = {
  "ios-phone": [
    { label: '6.9"', w: 1320, h: 2868 },
    { label: '6.5"', w: 1284, h: 2778 },
    { label: '6.3"', w: 1206, h: 2622 },
    { label: '6.1"', w: 1125, h: 2436 },
  ],
  "ios-tablet": [
    { label: '13" iPad', w: 2064, h: 2752 },
    { label: '12.9" iPad Pro', w: 2048, h: 2732 },
  ],
  "play-phone": [{ label: "Phone", w: 1080, h: 1920 }],
  "play-tablet-7": [{ label: '7" Portrait', w: 1200, h: 1920 }],
  "play-tablet-10": [{ label: '10" Portrait', w: 1600, h: 2560 }],
  "play-banner": [{ label: "Feature Graphic", w: 1024, h: 500 }],
};

// Landscape export sizes (tablets only).
const LANDSCAPE_SIZES: Partial<Record<Surface, OutputSize[]>> = {
  "play-tablet-7": [{ label: '7" Landscape', w: 1920, h: 1200 }],
  "play-tablet-10": [{ label: '10" Landscape', w: 2560, h: 1600 }],
};

export function allowsLandscape(surface: Surface): boolean {
  return surface in LANDSCAPE_SIZES;
}

export function outputSizesFor(surface: Surface, orientation: StageOrientation): OutputSize[] {
  if (orientation === "landscape") {
    return LANDSCAPE_SIZES[surface] || PORTRAIT_SIZES[surface];
  }
  return PORTRAIT_SIZES[surface];
}

export function storeFor(surface: Surface): Store {
  return surface === "ios-phone" || surface === "ios-tablet" ? "apple" : "google";
}

// The authoring canvas size for a surface, honouring landscape on tablets.
export function canvasSize(
  surface: Surface,
  orientation: StageOrientation,
): { w: number; h: number } {
  const geo = CANVAS_GEOMETRY[surface];
  const isLandscapeTablet =
    (surface === "play-tablet-7" || surface === "play-tablet-10") &&
    orientation === "landscape";
  if (isLandscapeTablet) {
    return { w: geo.landscapeW!, h: geo.landscapeH! };
  }
  return { w: geo.w, h: geo.h };
}

export const SURFACE_NAME: Record<Surface, string> = {
  "ios-phone": "iPhone",
  "ios-tablet": "iPad",
  "play-phone": "Android Phone",
  "play-tablet-7": 'Android 7" Tablet',
  "play-tablet-10": 'Android 10" Tablet',
  "play-banner": "Feature Graphic",
};

// Which surfaces live under each store tab, in display order.
export const SURFACES_BY_STORE: Record<Store, Surface[]> = {
  apple: ["ios-phone", "ios-tablet"],
  google: ["play-phone", "play-tablet-7", "play-tablet-10", "play-banner"],
};

// A single flat list of every surface (Apple first, then Google) for the
// unified surface picker.
export const SURFACE_ORDER: Surface[] = [
  ...SURFACES_BY_STORE.apple,
  ...SURFACES_BY_STORE.google,
];
