import type { Composition } from "./types";

// Friendly names shown in the composition dropdown.
export const COMPOSITION_NAME: Record<Composition, string> = {
  spotlight: "Spotlight",
  "anchored-base": "Anchored base",
  "anchored-crown": "Anchored crown",
  "stacked-pair": "Stacked pair",
  "type-only": "Type only",
  "side-by-side": "Side by side",
  banner: "Banner",
};

// One-line hint under each composition name.
export const COMPOSITION_HINT: Record<Composition, string> = {
  spotlight: "Headline up top, device sitting low",
  "anchored-base": "Headline top, device hugging the bottom",
  "anchored-crown": "Flipped — device on top, copy below",
  "stacked-pair": "Layered back + front devices",
  "type-only": "Big standalone headline, no device",
  "side-by-side": "Copy left, device right (landscape)",
  banner: "1024x500 Play feature graphic",
};

// Compositions offered in the dropdown, in order.
export const COMPOSITION_ORDER: Composition[] = [
  "spotlight",
  "anchored-base",
  "anchored-crown",
  "stacked-pair",
  "type-only",
  "side-by-side",
  "banner",
];
