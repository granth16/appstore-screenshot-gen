"use client";
import * as React from "react";
import type { Palette } from "@/domain/types";
import { shiftLightness } from "@/utils/color";

// The soft diagonal wash behind a scene. Dark scenes use the palette's dark
// variant; light scenes use the primary surface.
export function sceneWash(palette: Palette, dark?: boolean): string {
  const base = dark ? palette.surfaceDark : palette.surface;
  const drop = dark ? -8 : -6;
  return `linear-gradient(160deg, ${base} 0%, ${shiftLightness(base, drop)} 100%)`;
}

// The brighter banner wash used by the feature graphic.
export function bannerWash(palette: Palette): string {
  return `linear-gradient(135deg, ${palette.surfaceDark} 0%, ${shiftLightness(
    palette.surfaceDark,
    -10,
  )} 50%, ${palette.accent} 200%)`;
}

// A blurred accent circle for depth. Sizes are percentages of the canvas.
export function DecorBlob({
  canvasW,
  color,
  x,
  y,
  size,
  opacity = 0.4,
}: {
  canvasW: number;
  color: string;
  x: number;
  y: number;
  size: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: "1 / 1",
        background: color,
        borderRadius: "50%",
        filter: `blur(${canvasW * 0.06}px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
