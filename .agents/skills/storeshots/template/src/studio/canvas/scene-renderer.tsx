"use client";
import * as React from "react";
import { canvasSize } from "@/domain/surfaces";
import type {
  ElementKey,
  Palette,
  Scene,
  StageOrientation,
  Surface,
} from "@/domain/types";
import { asset } from "@/runtime/asset-cache";
import { expandCapturePath, readCopy } from "@/text/copy";
import { bannerWash, DecorBlob, sceneWash } from "./decor";
import { DeviceShell, shellFor, surfaceAspect } from "./device-shell";
import { baseLayer, resolveBox, resolveLayout } from "./blueprints";
import { CopyBlock } from "./copy-block";
import { DraggableBox } from "./draggable-box";
import { EditableText } from "./editable-text";
import type { PlacementRect, SceneEditHandlers } from "./editing";

type RendererProps = {
  scene: Scene;
  surface: Surface;
  orientation: StageOrientation;
  palette: Palette;
  locale: string;
  productName?: string;
  productIcon?: string;
  editable?: boolean;
  handlers?: SceneEditHandlers;
  selectedKey?: ElementKey | null;
  stageScale?: number;
  hideEmpty?: boolean;
};

export function SceneRenderer({
  scene,
  surface,
  orientation,
  palette,
  locale,
  productName,
  productIcon,
  editable,
  handlers,
  selectedKey = null,
  stageScale = 1,
  hideEmpty,
}: RendererProps) {
  const { w: canvasW, h: canvasH } = canvasSize(surface, orientation);

  // The Play feature banner is its own self-contained composition.
  if (scene.composition === "marquee" || surface === "play-banner") {
    return (
      <BannerScene
        scene={scene}
        palette={palette}
        locale={locale}
        canvasW={canvasW}
        productName={productName}
        productIcon={productIcon}
        editable={editable}
        handlers={handlers}
      />
    );
  }

  const capture = expandCapturePath(scene.capture, locale);
  const captureEcho = expandCapturePath(scene.captureEcho, locale);
  const shell = shellFor(surface, orientation);
  const aspect = surfaceAspect(surface, orientation);
  const dark = !!scene.dark;
  const layout = resolveLayout(scene.composition, canvasW, canvasH, aspect);

  const copyRect = resolveBox("copy", scene, layout);
  const screenRect = resolveBox("screen", scene, layout);
  const echoRect = resolveBox("screenEcho", scene, layout);

  function renderDevice(key: "screen" | "screenEcho", rect: PlacementRect, src: string, extra?: React.CSSProperties) {
    const override = scene.boxes?.[key];
    const rotation = override?.rotation ?? 0;
    const zIndex = override?.zIndex ?? baseLayer(key);
    return (
      <DraggableBox
        frame={rect}
        canvasW={canvasW}
        canvasH={canvasH}
        editable={editable}
        stageScale={stageScale}
        rotation={rotation}
        onChange={(box) => handlers?.onBoxChange?.(key, { ...box, rotation, zIndex })}
        lockAspectRatio={aspect}
        zIndex={zIndex}
        bleed
        selected={selectedKey === key}
        onSelect={() => handlers?.onSelect?.(key)}
      >
        <DeviceShell spec={shell} src={src} hideEmpty={hideEmpty} style={{ width: "100%", height: "100%", ...extra }} />
      </DraggableBox>
    );
  }

  function renderCopy() {
    if (!copyRect) return null;
    const override = scene.boxes?.copy;
    const rotation = override?.rotation ?? 0;
    const zIndex = override?.zIndex ?? baseLayer("copy");
    return (
      <DraggableBox
        frame={copyRect}
        canvasW={canvasW}
        canvasH={canvasH}
        editable={editable}
        stageScale={stageScale}
        rotation={rotation}
        onChange={(box) => handlers?.onBoxChange?.("copy", { ...box, rotation, zIndex })}
        zIndex={zIndex}
        selected={selectedKey === "copy"}
        onSelect={() => handlers?.onSelect?.("copy")}
      >
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-start" }}>
          <CopyBlock
            canvasW={canvasW}
            canvasH={canvasH}
            scene={scene}
            palette={palette}
            locale={locale}
            editable={editable}
            handlers={handlers}
            align={copyRect.align || "center"}
            dark={dark}
            onFocus={() => handlers?.onSelect?.("copy")}
          />
        </div>
      </DraggableBox>
    );
  }

  const onBackdropMouseDown = editable
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handlers?.onSelect?.(null);
      }
    : undefined;

  return (
    <div
      onMouseDown={onBackdropMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: sceneWash(palette, dark),
        color: dark ? palette.inkOnDark : palette.ink,
      }}
    >
      <DecorBlob canvasW={canvasW} color={palette.accent} x={78} y={-14} size={50} opacity={dark ? 0.22 : 0.3} />
      <DecorBlob canvasW={canvasW} color={palette.accent} x={-22} y={62} size={52} opacity={dark ? 0.16 : 0.24} />

      {echoRect && renderDevice("screenEcho", echoRect, captureEcho || capture, { opacity: 0.85 })}
      {screenRect && renderDevice("screen", screenRect, capture)}
      {renderCopy()}
    </div>
  );
}

function BannerScene({
  scene,
  palette,
  locale,
  canvasW,
  productName,
  productIcon,
  editable,
  handlers,
}: {
  scene: Scene;
  palette: Palette;
  locale: string;
  canvasW: number;
  productName?: string;
  productIcon?: string;
  editable?: boolean;
  handlers?: SceneEditHandlers;
}) {
  const iconSrc = productIcon ? asset(productIcon) : "";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: bannerWash(palette),
        display: "flex",
        alignItems: "center",
        padding: `0 ${canvasW * 0.07}px`,
        color: palette.inkOnDark,
      }}
    >
      <DecorBlob canvasW={canvasW} color={palette.accent} x={64} y={18} size={52} opacity={0.42} />
      <div style={{ display: "flex", alignItems: "center", gap: canvasW * 0.032, zIndex: 2 }}>
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            style={{
              width: canvasW * 0.13,
              height: canvasW * 0.13,
              borderRadius: canvasW * 0.024,
              boxShadow: "0 4px 18px rgba(0,0,0,0.32)",
            }}
            draggable={false}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: canvasW * 0.13,
              height: canvasW * 0.13,
              borderRadius: canvasW * 0.024,
              background: `linear-gradient(135deg, ${palette.accent}55, ${palette.accent})`,
              display: "grid",
              placeItems: "center",
              color: palette.inkOnDark,
              fontWeight: 800,
              fontSize: canvasW * 0.07,
              boxShadow: "0 4px 18px rgba(0,0,0,0.32)",
            }}
          >
            {(productName || "A").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: canvasW * 0.062, fontWeight: 800, lineHeight: 1.05 }}>
            {productName || "App"}
          </div>
          <EditableText
            value={readCopy(scene.headline, locale)}
            editable={editable}
            multiline
            onChange={handlers?.onHeadlineChange}
            style={{
              fontSize: canvasW * 0.029,
              color: "rgba(255,255,255,0.85)",
              marginTop: canvasW * 0.012,
              lineHeight: 1.25,
            }}
          />
        </div>
      </div>
    </div>
  );
}
