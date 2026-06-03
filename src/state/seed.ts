import { BASE_LOCALE } from "@/text/copy";
import type { Composition, Scene, StudioDoc, Surface } from "@/domain/types";

// Monotonic-ish unique id for scenes. Time prefix keeps ids sortable-by-age;
// the counter guards against collisions inside the same millisecond.
let counter = 0;
export const uid = (): string =>
  `sc_${Date.now().toString(36)}_${(counter++).toString(36)}`;

const base = (text: string) => ({ [BASE_LOCALE]: text });

function phoneDeck(captureRoot: string): Scene[] {
  return [
    {
      id: uid(),
      composition: "spotlight",
      label: base("WELCOME"),
      headline: base("Everything you need,\nin one tap."),
      capture: `${captureRoot}/{locale}/01.png`,
    },
    {
      id: uid(),
      composition: "anchored-base",
      label: base("HIGHLIGHT 01"),
      headline: base("Built to keep\nyou in flow."),
      capture: "",
    },
    {
      id: uid(),
      composition: "anchored-crown",
      label: base("HIGHLIGHT 02"),
      headline: base("Always a swipe away."),
      capture: "",
      dark: true,
    },
  ];
}

function tabletDeck(scale: "small" | "large"): Scene[] {
  return [
    {
      id: uid(),
      composition: "spotlight",
      label: base("WELCOME"),
      headline: base(
        scale === "small" ? "Pocket-sized\npower." : "Made for the\nbigger screen.",
      ),
      capture: "",
    },
    {
      id: uid(),
      composition: "side-by-side",
      label: base("HIGHLIGHT 01"),
      headline: base("Wider canvas,\nbolder ideas."),
      capture: "",
    },
  ];
}

function bannerDeck(): Scene[] {
  return [
    {
      id: uid(),
      composition: "banner",
      label: {},
      headline: base("Your tagline goes here."),
      capture: "",
    },
  ];
}

export const DEFAULT_DOC: StudioDoc = {
  productName: "Lumina",
  paletteId: "ink",
  locales: [BASE_LOCALE],
  locale: BASE_LOCALE,
  surface: "ios-phone",
  orientation: "portrait",
  productIcon: "",
  scenesBySurface: {
    "ios-phone": phoneDeck("/captures/apple/ios-phone"),
    "ios-tablet": tabletDeck("large"),
    "play-phone": phoneDeck("/captures/google/play-phone"),
    "play-tablet-7": tabletDeck("small"),
    "play-tablet-10": tabletDeck("large"),
    "play-banner": bannerDeck(),
  },
};

export function makeScene(composition: Composition = "anchored-base"): Scene {
  return {
    id: uid(),
    composition,
    label: base("NEW"),
    headline: base("Edit this\nheadline."),
    capture: "",
  };
}

// Convenience re-export so callers don't reach across to the surfaces module
// just to learn a scene's store.
export type { Surface };
