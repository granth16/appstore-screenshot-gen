import type { Composition } from "./types";

// Display names shown in the composition picker.
export const COMPOSITION_NAME: Record<Composition, string> = {
  beacon: "Beacon",
  plinth: "Plinth",
  canopy: "Canopy",
  duet: "Duet",
  manifesto: "Manifesto",
  column: "Column",
  marquee: "Marquee",
};

// A short note shown beneath each composition name.
export const COMPOSITION_HINT: Record<Composition, string> = {
  beacon: "Copy raised high, device floating low",
  plinth: "Copy on top, device resting on the base",
  canopy: "Device overhead, copy reading beneath",
  duet: "A paired back + front device",
  manifesto: "Copy only, oversized, no device",
  column: "Copy column left, device right (landscape)",
  marquee: "1024x500 Play feature banner",
};

// Order shown in the picker.
export const COMPOSITION_ORDER: Composition[] = [
  "beacon",
  "plinth",
  "canopy",
  "duet",
  "manifesto",
  "column",
  "marquee",
];
