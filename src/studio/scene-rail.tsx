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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// The left rail: an ordered, drag-sortable list of scenes for the active
// surface plus an "add scene" action.
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
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <h2 className="text-sm font-semibold">Scenes</h2>
        <p className="text-xs text-muted-foreground">
          {scenes.length} scene{scenes.length === 1 ? "" : "s"} · drag to reorder
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
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
              {scenes.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-xs font-medium text-foreground">No scenes yet</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Click <span className="font-semibold">Add scene</span> to get started.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t bg-card p-3">
        <Button
          type="button"
          className="w-full"
          onClick={() => onAdd(makeScene("anchored-base"))}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Add scene
        </Button>
      </div>
    </div>
  );
}
