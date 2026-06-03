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
import { bezelAspect, bezelFor } from "./bezels";
import { boxFor, templateRects } from "./composition-rects";
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
  // Stage scale (1.0 = full size) so react-rnd maps drag deltas through a
  // CSS-transformed container correctly.
  stageScale?: number;
  // Hide the "drop a capture" hint (so it doesn't bake into exports).
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
  const capture = expandCapturePath(scene.capture, locale);
  const captureEcho = expandCapturePath(scene.captureEcho, locale);
  const { Bezel, widthFrac, smallWidthFrac } = bezelFor(surface, orientation);
  const dark = !!scene.dark;
  const frameAspect = bezelAspect(surface, orientation);
  const rects = templateRects(
    scene.composition,
    canvasW,
    canvasH,
    frameAspect,
    widthFrac(canvasW, canvasH),
    smallWidthFrac(canvasW, canvasH),
  );

  // Banner (feature graphic) has its own self-contained composition.
  if (scene.composition === "banner" || surface === "play-banner") {
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

  const copyRect = boxFor("copy", scene, rects);
  const screenRect = boxFor("screen", scene, rects);
  const echoRect = boxFor("screenEcho", scene, rects);

  function renderBezel(key: "screen" | "screenEcho", rect: PlacementRect, src: string, extra?: React.CSSProperties) {
    const override = scene.boxes?.[key];
    const rotation = override?.rotation ?? 0;
    const zIndex = override?.zIndex ?? (key === "screenEcho" ? 2 : 3);
    return (
      <DraggableBox
        frame={rect}
        canvasW={canvasW}
        canvasH={canvasH}
        editable={editable}
        stageScale={stageScale}
        rotation={rotation}
        onChange={(box) => handlers?.onBoxChange?.(key, { ...box, rotation, zIndex })}
        lockAspectRatio={frameAspect}
        zIndex={zIndex}
        bleed
        selected={selectedKey === key}
        onSelect={() => handlers?.onSelect?.(key)}
      >
        <Bezel src={src} hideEmpty={hideEmpty} style={{ width: "100%", height: "100%", ...extra }} />
      </DraggableBox>
    );
  }

  function renderCopy() {
    if (!copyRect) return null;
    const override = scene.boxes?.copy;
    const rotation = override?.rotation ?? 0;
    const zIndex = override?.zIndex ?? 4;
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

  // Clicking bare background deselects. Guard against bubbled child clicks.
  const onBackgroundMouseDown = editable
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handlers?.onSelect?.(null);
      }
    : undefined;

  return (
    <div
      onMouseDown={onBackgroundMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: sceneWash(palette, dark),
        color: dark ? palette.inkOnDark : palette.ink,
      }}
    >
      <DecorBlob canvasW={canvasW} color={palette.accent} x={-15} y={-10} size={55} opacity={dark ? 0.25 : 0.32} />
      <DecorBlob canvasW={canvasW} color={palette.accent} x={70} y={75} size={45} opacity={dark ? 0.18 : 0.25} />

      {echoRect && renderBezel("screenEcho", echoRect, captureEcho || capture, { opacity: 0.85 })}
      {screenRect && renderBezel("screen", screenRect, capture)}
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
        padding: `0 ${canvasW * 0.06}px`,
        color: palette.inkOnDark,
      }}
    >
      <DecorBlob canvasW={canvasW} color={palette.accent} x={70} y={20} size={50} opacity={0.45} />
      <div style={{ display: "flex", alignItems: "center", gap: canvasW * 0.03, zIndex: 2 }}>
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            style={{
              width: canvasW * 0.13,
              height: canvasW * 0.13,
              borderRadius: canvasW * 0.022,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
            draggable={false}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: canvasW * 0.13,
              height: canvasW * 0.13,
              borderRadius: canvasW * 0.022,
              background: `linear-gradient(135deg, ${palette.accent}55, ${palette.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.inkOnDark,
              fontWeight: 800,
              fontSize: canvasW * 0.07,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            {(productName || "A").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: canvasW * 0.06, fontWeight: 800, lineHeight: 1.05 }}>
            {productName || "App"}
          </div>
          <EditableText
            value={readCopy(scene.headline, locale)}
            editable={editable}
            multiline
            onChange={handlers?.onHeadlineChange}
            style={{
              fontSize: canvasW * 0.028,
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
