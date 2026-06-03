"use client";
import * as React from "react";
import { COMPOSITION_NAME } from "@/domain/compositions";
import { canvasSize, SURFACE_NAME } from "@/domain/surfaces";
import type {
  BoxTransform,
  ElementKey,
  Palette,
  Scene,
  StageOrientation,
  Surface,
} from "@/domain/types";
import { SceneRenderer } from "./canvas/scene-renderer";

type Props = {
  scene: Scene;
  surface: Surface;
  orientation: StageOrientation;
  palette: Palette;
  locale: string;
  productName?: string;
  productIcon?: string;
  selectedKey: ElementKey | null;
  onLabelChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onBoxChange: (key: ElementKey, box: BoxTransform) => void;
  onSelect: (key: ElementKey | null) => void;
};

// Fits the full-resolution canvas inside the available area with transform:
// scale(), measured live via a ResizeObserver.
export function StageViewport({
  scene,
  surface,
  orientation,
  palette,
  locale,
  productName,
  productIcon,
  selectedKey,
  onLabelChange,
  onHeadlineChange,
  onBoxChange,
  onSelect,
}: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.2);
  const { w: canvasW, h: canvasH } = canvasSize(surface, orientation);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const rect = host.getBoundingClientRect();
      const sx = (rect.width - 48) / canvasW;
      const sy = (rect.height - 48) / canvasH;
      setScale(Math.max(0.05, Math.min(sx, sy)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [canvasW, canvasH]);

  return (
    <div
      ref={hostRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(60%_60%_at_50%_40%,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)]"
    >
      <div
        style={{
          width: canvasW,
          height: canvasH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.32), 0 10px 24px -12px rgba(0,0,0,0.18)",
          background: "white",
          borderRadius: 12 / scale,
          overflow: "hidden",
        }}
      >
        <SceneRenderer
          scene={scene}
          surface={surface}
          orientation={orientation}
          palette={palette}
          locale={locale}
          productName={productName}
          productIcon={productIcon}
          editable
          stageScale={scale}
          selectedKey={selectedKey}
          handlers={{ onLabelChange, onHeadlineChange, onBoxChange, onSelect }}
        />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{SURFACE_NAME[surface]}</span>
        <span aria-hidden>·</span>
        <span>{COMPOSITION_NAME[scene.composition]}</span>
        {orientation === "landscape" && (
          <>
            <span aria-hidden>·</span>
            <span>landscape</span>
          </>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
        <span>{canvasW}×{canvasH}</span>
        <span aria-hidden>·</span>
        <span>{(scale * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
