// ---------------------------------------------------------------------------
// Core domain vocabulary for the studio.
//
//   Surface      a store target we generate screenshots for
//   Composition  how a single scene arranges its copy + device bezels
//   Scene        one exported screenshot (the editable unit)
//   StudioDoc    the whole persisted workspace
// ---------------------------------------------------------------------------

export type Surface =
  | "ios-phone"
  | "ios-tablet"
  | "play-phone"
  | "play-tablet-7"
  | "play-tablet-10"
  | "play-banner";

export type StageOrientation = "portrait" | "landscape";

export type Store = "apple" | "google";

// Arrangements a scene can adopt. Mixing them gives a deck visual rhythm.
export type Composition =
  | "spotlight"      // headline up top, device anchored low
  | "anchored-base"  // headline top, device hugging the bottom edge
  | "anchored-crown" // device up top, headline below (the inverse)
  | "stacked-pair"   // a back + front device, headline above
  | "type-only"      // oversized headline, no device, decorative wash
  | "side-by-side"   // landscape: copy on the left, device on the right
  | "banner";        // 1024x500 Play feature graphic

// A positioned, optionally rotated box in canvas pixel space.
export type BoxTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
};

export type ElementKey = "copy" | "screen" | "screenEcho";

// Text keyed by locale code ("en", "de", ...). A key is simply absent when the
// user hasn't translated it yet; readers fall back (see text/copy.ts). The set
// of locales a document targets lives on StudioDoc.locales.
export type LocalizedCopy = Partial<Record<string, string>>;

export type Scene = {
  id: string;
  composition: Composition;
  label: LocalizedCopy;        // tiny uppercase eyebrow above the headline
  headline: LocalizedCopy;     // multi-line; newlines are deliberate
  capture: string;             // path under /captures — may embed {locale}
  captureEcho?: string;        // the back device for stacked-pair
  dark?: boolean;              // dark background variant
  boxes?: Partial<Record<ElementKey, BoxTransform>>; // per-element overrides
};

export type PaletteId = "ink" | "frost" | "clay" | "lagoon";

export type Palette = {
  id: PaletteId;
  name: string;
  surface: string;     // primary background
  surfaceDark: string; // dark-variant background
  ink: string;         // text on surface
  inkOnDark: string;   // text on surfaceDark
  accent: string;
  muted: string;
};

export type StudioDoc = {
  productName: string;
  paletteId: PaletteId;
  // Locales this document targets — drives the locale switcher and bulk export.
  // Single-locale documents ship as ["en"] and hide the locale UI.
  locales: string[];
  locale: string;
  surface: Surface;
  orientation: StageOrientation;
  // Per-surface decks so switching tabs preserves every deck.
  scenesBySurface: Record<Surface, Scene[]>;
  productIcon?: string; // path under /public
};
