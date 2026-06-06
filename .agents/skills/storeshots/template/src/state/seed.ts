import { BASE_LOCALE } from "@/text/copy";
import type { Composition, Scene, StudioDoc, Surface } from "@/domain/types";

// Monotonic-ish unique id for scenes. Time prefix keeps ids sortable-by-age;
// the counter guards against collisions inside the same millisecond.
let counter = 0;
export const uid = (): string =>
  `sc_${Date.now().toString(36)}_${(counter++).toString(36)}`;

const base = (text: string) => ({ [BASE_LOCALE]: text });

function phoneDeck(): Scene[] {
  return [
    {
      id: uid(),
      composition: "beacon",
      label: base("WELCOME"),
      headline: base("Everything you need,\nin one tap."),
      capture: "",
    },
    {
      id: uid(),
      composition: "plinth",
      label: base("HIGHLIGHT 01"),
      headline: base("Built to keep\nyou in flow."),
      capture: "",
    },
    {
      id: uid(),
      composition: "canopy",
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
      composition: "beacon",
      label: base("WELCOME"),
      headline: base(
        scale === "small" ? "Pocket-sized\npower." : "Made for the\nbigger screen.",
      ),
      capture: "",
    },
    {
      id: uid(),
      composition: "column",
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
      composition: "marquee",
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
    "ios-phone": phoneDeck(),
    "ios-tablet": tabletDeck("large"),
    "play-phone": phoneDeck(),
    "play-tablet-7": tabletDeck("small"),
    "play-tablet-10": tabletDeck("large"),
    "play-banner": bannerDeck(),
  },
};

export function makeScene(composition: Composition = "plinth"): Scene {
  return {
    id: uid(),
    composition,
    label: base("NEW"),
    headline: base("Edit this\nheadline."),
    capture: "",
  };
}

export type { Surface };
