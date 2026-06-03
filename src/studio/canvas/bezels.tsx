"use client";
import * as React from "react";
import {
  IOS_BEZEL_ASSET,
  IOS_SCREEN_WINDOW,
  IOS_BEZEL_RATIO,
  IOS_TABLET_RATIO,
  PLAY_PHONE_RATIO,
  PLAY_TABLET_LANDSCAPE_RATIO,
  PLAY_TABLET_PORTRAIT_RATIO,
  iosTabletWidthFraction,
  phoneWidthFraction,
  phoneWidthFractionSmall,
  playTabletLandscapeWidthFraction,
  playTabletPortraitWidthFraction,
} from "@/domain/settings";
import type { StageOrientation, Surface } from "@/domain/types";
import { asset } from "@/runtime/asset-cache";

export type BezelProps = {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  /** Suppress the empty-state placeholder (used when baking exports). */
  hideEmpty?: boolean;
};

export type BezelComponent = React.ComponentType<BezelProps>;

// Shared: render the capture inside a device window, or an empty hint.
function CaptureFill({ src, alt = "", hideEmpty }: { src: string; alt?: string; hideEmpty?: boolean }) {
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
  return hideEmpty ? null : <EmptyCapture />;
}

// iPhone — composited over the measured bezel PNG.
export function IosPhoneBezel({ src, alt = "", style, hideEmpty }: BezelProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "1022 / 2082", ...style }}>
      <img
        src={asset(IOS_BEZEL_ASSET)}
        alt=""
        style={{ display: "block", width: "100%", height: "100%" }}
        draggable={false}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          overflow: "hidden",
          left: `${IOS_SCREEN_WINDOW.left}%`,
          top: `${IOS_SCREEN_WINDOW.top}%`,
          width: `${IOS_SCREEN_WINDOW.width}%`,
          height: `${IOS_SCREEN_WINDOW.height}%`,
          borderRadius: `${IOS_SCREEN_WINDOW.radiusX}% / ${IOS_SCREEN_WINDOW.radiusY}%`,
          background: "#111",
        }}
      >
        <CaptureFill src={src} alt={alt} hideEmpty={hideEmpty} />
      </div>
    </div>
  );
}

export function PlayPhoneBezel({ src, alt = "", style, hideEmpty }: BezelProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "9 / 19.5", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8% / 4%",
          background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.55)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "3%",
            height: "1.4%",
            borderRadius: "50%",
            background: "#0d0d0f",
            border: "1px solid rgba(255,255,255,0.06)",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "3.5%",
            top: "2%",
            width: "93%",
            height: "96%",
            borderRadius: "5.5% / 2.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <CaptureFill src={src} alt={alt} hideEmpty={hideEmpty} />
        </div>
      </div>
    </div>
  );
}

export function PlayTabletPortraitBezel({ src, alt = "", style, hideEmpty }: BezelProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "5 / 8", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "4.5% / 2.8%",
          background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.2%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1.4%",
            height: "0.88%",
            borderRadius: "50%",
            background: "#0d0d0f",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "3.5%",
            top: "2.2%",
            width: "93%",
            height: "95.6%",
            borderRadius: "2.5% / 1.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <CaptureFill src={src} alt={alt} hideEmpty={hideEmpty} />
        </div>
      </div>
    </div>
  );
}

export function PlayTabletLandscapeBezel({ src, alt = "", style, hideEmpty }: BezelProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "8 / 5", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "2.8% / 4.5%",
          background: "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "1.2%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "0.88%",
            height: "1.4%",
            borderRadius: "50%",
            background: "#0d0d0f",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "2.2%",
            top: "3.5%",
            width: "95.6%",
            height: "93%",
            borderRadius: "1.6% / 2.5%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <CaptureFill src={src} alt={alt} hideEmpty={hideEmpty} />
        </div>
      </div>
    </div>
  );
}

export function IosTabletBezel({ src, alt = "", style, hideEmpty }: BezelProps) {
  return (
    <div style={{ position: "relative", aspectRatio: "770 / 1000", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "5% / 3.6%",
          background: "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.2%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0.9%",
            height: "0.65%",
            borderRadius: "50%",
            background: "#111113",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "4%",
            top: "2.8%",
            width: "92%",
            height: "94.4%",
            borderRadius: "2.2% / 1.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <CaptureFill src={src} alt={alt} hideEmpty={hideEmpty} />
        </div>
      </div>
    </div>
  );
}

function EmptyCapture() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.4)",
        fontSize: "min(2vw, 14px)",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
        textAlign: "center",
        padding: "4%",
      }}
    >
      Drop a capture here
    </div>
  );
}

// Aspect ratio (w/h) of each surface's bezel — must match the components above.
export function bezelAspect(surface: Surface, orientation: StageOrientation): number {
  switch (surface) {
    case "ios-phone":
      return IOS_BEZEL_RATIO;
    case "play-phone":
      return PLAY_PHONE_RATIO;
    case "ios-tablet":
      return IOS_TABLET_RATIO;
    case "play-tablet-7":
    case "play-tablet-10":
      return orientation === "landscape"
        ? PLAY_TABLET_LANDSCAPE_RATIO
        : PLAY_TABLET_PORTRAIT_RATIO;
    default:
      return 1;
  }
}

// The bezel component + its width fractions for a given surface/orientation.
export function bezelFor(
  surface: Surface,
  orientation: StageOrientation,
): {
  Bezel: BezelComponent;
  widthFrac: (cw: number, ch: number) => number;
  smallWidthFrac: (cw: number, ch: number) => number;
} {
  switch (surface) {
    case "ios-phone":
      return { Bezel: IosPhoneBezel, widthFrac: phoneWidthFraction, smallWidthFrac: phoneWidthFractionSmall };
    case "ios-tablet":
      return {
        Bezel: IosTabletBezel,
        widthFrac: iosTabletWidthFraction,
        smallWidthFrac: (cw, ch) => iosTabletWidthFraction(cw, ch, 0.6),
      };
    case "play-phone":
      return { Bezel: PlayPhoneBezel, widthFrac: phoneWidthFraction, smallWidthFrac: phoneWidthFractionSmall };
    case "play-tablet-7":
    case "play-tablet-10":
      if (orientation === "landscape") {
        return {
          Bezel: PlayTabletLandscapeBezel,
          widthFrac: playTabletLandscapeWidthFraction,
          smallWidthFrac: (cw, ch) => playTabletLandscapeWidthFraction(cw, ch, 0.5),
        };
      }
      return {
        Bezel: PlayTabletPortraitBezel,
        widthFrac: playTabletPortraitWidthFraction,
        smallWidthFrac: (cw, ch) => playTabletPortraitWidthFraction(cw, ch, 0.62),
      };
    default:
      return { Bezel: IosPhoneBezel, widthFrac: phoneWidthFraction, smallWidthFrac: phoneWidthFractionSmall };
  }
}
