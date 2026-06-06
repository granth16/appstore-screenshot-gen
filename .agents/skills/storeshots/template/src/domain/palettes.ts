import type { Palette, PaletteId } from "./types";

// Background/foreground/accent sets a scene can be painted with. Each palette
// carries both a primary and a dark variant so individual scenes can flip
// without leaving the family.
export const PALETTES: Record<PaletteId, Palette> = {
  ink: {
    id: "ink",
    name: "Ink",
    surface: "#11131A",
    surfaceDark: "#F4F5F7",
    ink: "#F4F5F7",
    inkOnDark: "#11131A",
    accent: "#F26D4B",
    muted: "#8B91A1",
  },
  frost: {
    id: "frost",
    name: "Frost",
    surface: "#EEF4F8",
    surfaceDark: "#122231",
    ink: "#122231",
    inkOnDark: "#EEF4F8",
    accent: "#2E9E8F",
    muted: "#5C6B79",
  },
  clay: {
    id: "clay",
    name: "Clay",
    surface: "#F3E7DC",
    surfaceDark: "#2A2018",
    ink: "#2A2018",
    inkOnDark: "#F3E7DC",
    accent: "#C25E3A",
    muted: "#8A6F5C",
  },
  lagoon: {
    id: "lagoon",
    name: "Lagoon",
    surface: "#0E2A2B",
    surfaceDark: "#E6F2EE",
    ink: "#E6F2EE",
    inkOnDark: "#0E2A2B",
    accent: "#5BD6B0",
    muted: "#6FA39A",
  },
};

export const PALETTE_ORDER: PaletteId[] = ["ink", "frost", "clay", "lagoon"];
