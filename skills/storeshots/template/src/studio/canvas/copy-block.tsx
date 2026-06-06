"use client";
import * as React from "react";
import type { Palette, Scene } from "@/domain/types";
import { readCopy } from "@/text/copy";
import { EditableText } from "./editable-text";
import type { SceneEditHandlers } from "./editing";

// The eyebrow label + headline pairing. Type sizes scale off the shorter
// canvas dimension so landscape layouts don't blow the headline up too tall.
export function CopyBlock({
  canvasW,
  canvasH,
  scene,
  palette,
  locale,
  editable,
  handlers,
  align = "center",
  dark,
  onFocus,
}: {
  canvasW: number;
  canvasH: number;
  scene: Scene;
  palette: Palette;
  locale: string;
  editable?: boolean;
  handlers?: SceneEditHandlers;
  align?: "center" | "left";
  dark?: boolean;
  onFocus?: () => void;
}) {
  const textColor = dark ? palette.inkOnDark : palette.ink;
  const unit = Math.min(canvasW, canvasH);

  return (
    <div style={{ textAlign: align, position: "relative", width: "100%" }}>
      <EditableText
        value={readCopy(scene.label, locale)}
        editable={editable}
        onChange={handlers?.onLabelChange}
        onFocus={onFocus}
        placeholder="LABEL"
        style={{
          fontSize: unit * 0.028,
          fontWeight: 600,
          letterSpacing: unit * 0.0015,
          color: palette.accent,
          textTransform: "uppercase",
          marginBottom: unit * 0.018,
          minHeight: unit * 0.03,
        }}
      />
      <EditableText
        value={readCopy(scene.headline, locale)}
        editable={editable}
        multiline
        onChange={handlers?.onHeadlineChange}
        onFocus={onFocus}
        placeholder="Headline goes here"
        style={{
          fontSize: unit * 0.092,
          fontWeight: 700,
          lineHeight: 0.96,
          letterSpacing: -unit * 0.001,
          color: textColor,
        }}
      />
    </div>
  );
}
