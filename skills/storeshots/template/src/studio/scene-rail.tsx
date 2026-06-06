"use client";
import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Palette, Scene, StageOrientation, Surface } from "@/domain/types";
import { makeScene } from "@/state/seed";
import { SceneTile } from "./scene-tile";

type Props = {
  scenes: Scene[];
  activeId: string | null;
  surface: Surface;
  orientation: StageOrientation;
  palette: Palette;
  locale: string;
  productName?: string;
  productIcon?: string;
  disabled?: boolean;
  onReorder: (next: Scene[]) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAdd: (scene: Scene) => void;
};

// The bottom filmstrip: a horizontally scrollable, drag-sortable row of scene
// thumbnails with a trailing "new frame" tile.
export function SceneRail({
  scenes,
  activeId,
  surface,
  orientation,
  palette,
  locale,
  productName,
  productIcon,
  disabled,
  onReorder,
  onSelect,
  onDelete,
  onDuplicate,
  onAdd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = scenes.findIndex((s) => s.id === active.id);
    const to = scenes.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(scenes, from, to));
  };

  return (
    <div className="flex h-full items-stretch">
      <div className="flex w-32 shrink-0 flex-col justify-center border-r border-border px-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Storyboard
        </span>
        <span className="mt-0.5 text-xs text-foreground">
          {scenes.length} frame{scenes.length === 1 ? "" : "s"}
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">drag to reorder</span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={scenes.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex h-full items-center gap-3 px-4">
              {scenes.map((scene, i) => (
                <SceneTile
                  key={scene.id}
                  scene={scene}
                  index={i}
                  active={scene.id === activeId}
                  surface={surface}
                  orientation={orientation}
                  palette={palette}
                  locale={locale}
                  productName={productName}
                  productIcon={productIcon}
                  onSelect={() => onSelect(scene.id)}
                  onDelete={() => onDelete(scene.id)}
                  onDuplicate={() => onDuplicate(scene.id)}
                />
              ))}

              <button
                type="button"
                onClick={() => onAdd(makeScene("plinth"))}
                disabled={disabled}
                className="flex h-[104px] w-[78px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-brand/70 hover:bg-secondary hover:text-foreground disabled:opacity-40"
                title="Add a new frame"
                aria-label="Add a new frame"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">New frame</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
