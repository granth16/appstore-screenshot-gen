import type { BoxTransform, ElementKey } from "@/domain/types";

// Callbacks the editable scene renderer wires up. Absent in export/thumbnail
// (read-only) renders.
export type SceneEditHandlers = {
  onLabelChange?: (value: string) => void;
  onHeadlineChange?: (value: string) => void;
  onBoxChange?: (key: ElementKey, box: BoxTransform) => void;
  onSelect?: (key: ElementKey | null) => void;
};

// A plain placement rect, with an optional text alignment for the copy block.
export type PlacementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  align?: "center" | "left";
};

export type CompositionRects = {
  copy?: PlacementRect;
  screen?: PlacementRect;
  screenEcho?: PlacementRect;
};
