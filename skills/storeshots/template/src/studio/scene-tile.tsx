"use client";
import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Trash2 } from "lucide-react";
import { canvasSize } from "@/domain/surfaces";
import type { Palette, Scene, StageOrientation, Surface } from "@/domain/types";
import { readCopy } from "@/text/copy";
import { cn } from "@/utils/cn";
import { SceneRenderer } from "./canvas/scene-renderer";

type Props = {
  scene: Scene;
  index: number;
  active: boolean;
  surface: Surface;
  orientation: StageOrientation;
  palette: Palette;
  locale: string;
  productName?: string;
  productIcon?: string;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

// Filmstrip thumbnail sizing: fit inside this box without distorting aspect.
const TILE_HEIGHT = 80;
const TILE_MAX_WIDTH = 150;

export function SceneTile({
  scene,
  index,
  active,
  surface,
  orientation,
  palette,
  locale,
  productName,
  productIcon,
  onSelect,
  onDelete,
  onDuplicate,
}: Props) {
  const headline = readCopy(scene.headline, locale);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const { w: canvasW, h: canvasH } = canvasSize(surface, orientation);
  const fit = Math.min(TILE_HEIGHT / canvasH, TILE_MAX_WIDTH / canvasW);
  const thumbW = Math.round(canvasW * fit);
  const thumbH = Math.round(canvasH * fit);

  const sortStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div ref={setNodeRef} style={sortStyle} className="group relative shrink-0">
      <button
        type="button"
        onClick={onSelect}
        {...attributes}
        {...listeners}
        title={headline.split("\n")[0] || `Frame ${index + 1}`}
        aria-label={`Frame ${index + 1}`}
        className={cn(
          "relative block cursor-grab overflow-hidden rounded-lg border bg-black/60 transition-all active:cursor-grabbing",
          active
            ? "border-brand ring-2 ring-brand"
            : "border-border hover:border-foreground/40",
        )}
        style={{ width: thumbW, height: thumbH }}
      >
        <div
          style={{
            width: canvasW,
            height: canvasH,
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "top left",
            transform: `scale(${fit})`,
            pointerEvents: "none",
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
            editable={false}
          />
        </div>

        <span
          className={cn(
            "pointer-events-none absolute bottom-1 left-1 grid h-4 min-w-4 place-items-center rounded px-1 text-[9px] font-bold tabular-nums",
            active ? "bg-brand text-brand-foreground" : "bg-black/70 text-white/90",
          )}
        >
          {index + 1}
        </span>
      </button>

      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            stopBubble(e);
            onDuplicate();
          }}
          onPointerDown={stopBubble}
          className="grid h-5 w-5 place-items-center rounded bg-black/70 text-white/85 hover:bg-black hover:text-white"
          aria-label={`Duplicate frame ${index + 1}`}
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            stopBubble(e);
            onDelete();
          }}
          onPointerDown={stopBubble}
          className="grid h-5 w-5 place-items-center rounded bg-black/70 text-white/85 hover:bg-destructive hover:text-destructive-foreground"
          aria-label={`Delete frame ${index + 1}`}
          title="Delete (undoable)"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
