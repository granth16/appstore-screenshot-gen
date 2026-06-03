"use client";
import * as React from "react";
import { Rnd } from "react-rnd";
import type { BoxTransform } from "@/domain/types";

type Box = { x: number; y: number; width: number; height: number };

// When a box is allowed to bleed off-canvas, keep at least this fraction of it
// on screen so there's always a graspable handle.
const MIN_VISIBLE_FRACTION = 0.1;

export function clampBox(box: Box, canvasW: number, canvasH: number, bleed = false): Box {
  if (bleed) {
    const minX = Math.max(8, box.width * MIN_VISIBLE_FRACTION);
    const minY = Math.max(8, box.height * MIN_VISIBLE_FRACTION);
    return {
      width: box.width,
      height: box.height,
      x: Math.max(-(box.width - minX), Math.min(box.x, canvasW - minX)),
      y: Math.max(-(box.height - minY), Math.min(box.y, canvasH - minY)),
    };
  }
  const width = Math.min(box.width, canvasW);
  const height = Math.min(box.height, canvasH);
  return {
    width,
    height,
    x: Math.max(0, Math.min(box.x, canvasW - width)),
    y: Math.max(0, Math.min(box.y, canvasH - height)),
  };
}

const HANDLE = 14;
const handleStyles: Record<string, React.CSSProperties> = {
  top: { height: HANDLE },
  right: { width: HANDLE },
  bottom: { height: HANDLE },
  left: { width: HANDLE },
  topRight: { width: HANDLE, height: HANDLE },
  bottomRight: { width: HANDLE, height: HANDLE },
  bottomLeft: { width: HANDLE, height: HANDLE },
  topLeft: { width: HANDLE, height: HANDLE },
};

// A draggable/resizable wrapper. In read-only mode (export, thumbnails) it
// degrades to a plain absolutely-positioned div so html-to-image stays
// deterministic. Rotation lives on an inner wrapper so the Rnd's axis-aligned
// rect remains the source of truth for drag/resize maths.
export function DraggableBox({
  frame,
  canvasW,
  canvasH,
  editable,
  stageScale,
  onChange,
  children,
  lockAspectRatio,
  zIndex,
  rotation = 0,
  bleed = false,
  selected = false,
  onSelect,
}: {
  frame: Box;
  canvasW: number;
  canvasH: number;
  editable?: boolean;
  stageScale: number;
  onChange: (box: BoxTransform) => void;
  children: React.ReactNode;
  lockAspectRatio?: number | boolean;
  zIndex?: number;
  rotation?: number;
  bleed?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const rotated = (
    <div
      onMouseDown={() => {
        if (editable) onSelect?.();
      }}
      style={{
        width: "100%",
        height: "100%",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );

  if (!editable) {
    return (
      <div
        style={{
          position: "absolute",
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          zIndex,
        }}
      >
        {rotated}
      </div>
    );
  }

  const view = clampBox(frame, canvasW, canvasH, bleed);

  return (
    <Rnd
      bounds={bleed ? undefined : "parent"}
      scale={stageScale}
      lockAspectRatio={lockAspectRatio}
      position={{ x: view.x, y: view.y }}
      size={{ width: view.width, height: view.height }}
      onDragStart={() => onSelect?.()}
      onResizeStart={() => onSelect?.()}
      onDragStop={(_e, d) => {
        onChange(clampBox({ ...view, x: d.x, y: d.y }, canvasW, canvasH, bleed));
      }}
      onResizeStop={(_e, _dir, node, _delta, position) => {
        onChange(
          clampBox(
            {
              x: position.x,
              y: position.y,
              width: parseFloat(node.style.width),
              height: parseFloat(node.style.height),
            },
            canvasW,
            canvasH,
            bleed,
          ),
        );
      }}
      style={{ zIndex }}
      resizeHandleStyles={handleStyles}
      className={selected ? "drag-box drag-box--selected" : "drag-box"}
    >
      {rotated}
    </Rnd>
  );
}
