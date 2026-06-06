"use client";
import * as React from "react";
import type { StageOrientation, Surface } from "@/domain/types";
import { asset } from "@/runtime/asset-cache";

// A device "shell" is described entirely by data and drawn with CSS — no PNG
// overlays. Each surface maps to one spec; the renderer scales the shell to
// whatever box the layout assigns.
type CameraKind = "island" | "dot" | "hole-top" | "hole-left" | "none";

export type ShellSpec = {
  aspect: number; // width / height of the whole shell
  frame: string; // body fill
  rim: string; // body box-shadow
  bodyRadius: string;
  inset: number; // % gap from body edge to screen on every side
  screenRadius: string;
  camera: CameraKind;
};

// Hand-tuned silhouettes. Numbers are intentionally our own — they don't trace
// any pre-measured mockup.
const SHELLS: Record<string, ShellSpec> = {
  "ios-phone": {
    aspect: 0.462,
    frame: "linear-gradient(150deg, #44474e 0%, #1b1d22 100%)",
    rim: "inset 0 0 0 1px rgba(255,255,255,0.12), 0 10px 44px rgba(0,0,0,0.55)",
    bodyRadius: "15% / 7.2%",
    inset: 2.6,
    screenRadius: "12% / 5.6%",
    camera: "island",
  },
  "ios-tablet": {
    aspect: 0.75,
    frame: "linear-gradient(165deg, #3b3e45 0%, #181a1f 100%)",
    rim: "inset 0 0 0 1px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.6)",
    bodyRadius: "5.2% / 3.9%",
    inset: 3.2,
    screenRadius: "3% / 2.2%",
    camera: "dot",
  },
  "play-phone": {
    aspect: 0.475,
    frame: "linear-gradient(150deg, #33363d 0%, #131419 100%)",
    rim: "inset 0 0 0 1px rgba(255,255,255,0.09), 0 9px 42px rgba(0,0,0,0.58)",
    bodyRadius: "9% / 4.4%",
    inset: 3,
    screenRadius: "6% / 2.9%",
    camera: "hole-top",
  },
  "play-tablet-portrait": {
    aspect: 0.64,
    frame: "linear-gradient(160deg, #34373e 0%, #15171c 100%)",
    rim: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 9px 48px rgba(0,0,0,0.62)",
    bodyRadius: "5% / 3.1%",
    inset: 3.4,
    screenRadius: "2.7% / 1.7%",
    camera: "hole-top",
  },
  "play-tablet-landscape": {
    aspect: 1.56,
    frame: "linear-gradient(160deg, #34373e 0%, #15171c 100%)",
    rim: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 9px 48px rgba(0,0,0,0.62)",
    bodyRadius: "3.1% / 4.9%",
    inset: 3.4,
    screenRadius: "1.7% / 2.7%",
    camera: "hole-left",
  },
};

export function shellFor(surface: Surface, orientation: StageOrientation): ShellSpec {
  switch (surface) {
    case "ios-phone":
      return SHELLS["ios-phone"];
    case "ios-tablet":
      return SHELLS["ios-tablet"];
    case "play-phone":
      return SHELLS["play-phone"];
    case "play-tablet-7":
    case "play-tablet-10":
      return orientation === "landscape"
        ? SHELLS["play-tablet-landscape"]
        : SHELLS["play-tablet-portrait"];
    default:
      return SHELLS["ios-phone"];
  }
}

export function surfaceAspect(surface: Surface, orientation: StageOrientation): number {
  return shellFor(surface, orientation).aspect;
}

function Lens({ kind }: { kind: CameraKind }) {
  if (kind === "none") return null;
  const base: React.CSSProperties = {
    position: "absolute",
    background: "#05060a",
    zIndex: 20,
  };
  if (kind === "island") {
    return (
      <span
        style={{
          ...base,
          top: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "24%",
          height: "3.4%",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      />
    );
  }
  if (kind === "hole-top") {
    return (
      <span style={{ ...base, top: "1.6%", left: "50%", transform: "translateX(-50%)", width: "2.6%", height: "1.3%", borderRadius: "50%" }} />
    );
  }
  if (kind === "hole-left") {
    return (
      <span style={{ ...base, left: "1.4%", top: "50%", transform: "translateY(-50%)", width: "0.8%", height: "1.3%", borderRadius: "50%" }} />
    );
  }
  // dot
  return (
    <span style={{ ...base, top: "1.4%", left: "50%", transform: "translateX(-50%)", width: "0.9%", height: "0.62%", borderRadius: "50%" }} />
  );
}

function ScreenFill({ src, alt = "", hideEmpty }: { src: string; alt?: string; hideEmpty?: boolean }) {
  const resolved = asset(src);
  if (resolved) {
    return (
      <img
        src={resolved}
        alt={alt}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        draggable={false}
      />
    );
  }
  if (hideEmpty) return null;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "6%",
        color: "rgba(255,255,255,0.42)",
        fontSize: "min(2vw, 13px)",
        background: "repeating-linear-gradient(45deg, #14151a 0 12px, #0c0d11 12px 24px)",
      }}
    >
      add a capture
    </div>
  );
}

export type DeviceShellProps = {
  spec: ShellSpec;
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  hideEmpty?: boolean;
};

// Draws the framed device at whatever size its wrapper sets.
export function DeviceShell({ spec, src, alt, style, hideEmpty }: DeviceShellProps) {
  return (
    <div style={{ position: "relative", aspectRatio: String(spec.aspect), ...style }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: spec.bodyRadius,
          background: spec.frame,
          boxShadow: spec.rim,
        }}
      >
        <Lens kind={spec.camera} />
        <div
          style={{
            position: "absolute",
            left: `${spec.inset}%`,
            top: `${spec.inset}%`,
            right: `${spec.inset}%`,
            bottom: `${spec.inset}%`,
            overflow: "hidden",
            borderRadius: spec.screenRadius,
            background: "#000",
          }}
        >
          <ScreenFill src={src} alt={alt} hideEmpty={hideEmpty} />
        </div>
      </div>
    </div>
  );
}
