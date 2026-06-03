"use client";
import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPOSITION_NAME } from "@/domain/compositions";
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

// Preview tile width in pixels; height follows the surface aspect.
const TILE_WIDTH = 60;

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
  const label = readCopy(scene.label, locale);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const { w: canvasW, h: canvasH } = canvasSize(surface, orientation);
  const aspect = canvasW / canvasH;
  const tileHeight = Math.max(34, Math.min(120, Math.round(TILE_WIDTH / aspect)));
  const previewScale = TILE_WIDTH / canvasW;

  const sortStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={sortStyle}
      className={cn(
        "group relative flex items-stretch gap-2 rounded-lg border bg-card p-1.5 transition-all hover:border-foreground/30 hover:bg-accent",
        active && "border-primary ring-1 ring-primary",
      )}
    >
      <button
        type="button"
        className="flex w-3 cursor-grab items-center justify-center text-muted-foreground/60 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Reorder scene ${index + 1} (space, then arrows)`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 items-center gap-3 overflow-hidden text-left"
      >
        <div
          className="relative shrink-0 overflow-hidden rounded border bg-muted"
          style={{ width: TILE_WIDTH, height: tileHeight }}
        >
          <div
            style={{
              width: canvasW,
              height: canvasH,
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "top left",
              transform: `scale(${previewScale})`,
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
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            {`Scene ${index + 1} · ${COMPOSITION_NAME[scene.composition]}`}
          </span>
          <span className="truncate text-sm font-medium leading-tight">
            {headline.split("\n")[0] || (
              <em className="font-normal text-muted-foreground">Untitled</em>
            )}
          </span>
          {label ? (
            <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
          ) : null}
        </div>
      </button>

      <div className="flex flex-col items-center justify-center gap-0.5 opacity-60 transition-opacity focus-within:opacity-100 group-hover:opacity-100 md:opacity-0">
        <Button
          type="button"
          scale="icon"
          tone="quiet"
          className="h-6 w-6"
          onClick={onDuplicate}
          aria-label={`Duplicate scene ${index + 1}`}
          title="Duplicate scene"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          scale="icon"
          tone="quiet"
          className="h-6 w-6 hover:text-destructive"
          onClick={onDelete}
          aria-label={`Delete scene ${index + 1}`}
          title="Delete scene (undoable)"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
