"use client";
import * as React from "react";
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMPOSITION_HINT, COMPOSITION_NAME, COMPOSITION_ORDER } from "@/domain/compositions";
import type { BoxTransform, Composition, ElementKey, Scene } from "@/domain/types";
import { editCopy, readCopy } from "@/text/copy";
import { defaultZ } from "./canvas/composition-rects";
import { MediaDropField } from "./media-drop-field";

type Props = {
  scene: Scene;
  locale: string;
  selectedKey: ElementKey | null;
  onChange: (patch: Partial<Scene>) => void;
};

const ELEMENT_NAME: Record<ElementKey, string> = {
  copy: "Headline",
  screen: "Device",
  screenEcho: "Back device",
};

export function InspectorPanel({ scene, locale, selectedKey, onChange }: Props) {
  const isBanner = scene.composition === "banner";
  const isTypeOnly = scene.composition === "type-only";
  const localeLabel = scene.label?.[locale] ?? "";
  const localeHeadline = scene.headline?.[locale] ?? "";
  const headlineFallback = isBanner ? "Your tagline." : "One idea\nper scene.";
  const labelPlaceholder = localeLabel ? "HIGHLIGHT 01" : readCopy(scene.label, locale) || "HIGHLIGHT 01";
  const headlinePlaceholder = localeHeadline
    ? headlineFallback
    : readCopy(scene.headline, locale) || headlineFallback;

  const writeField = (key: "label" | "headline", value: string) => {
    onChange({ [key]: editCopy(scene[key], locale, value) } as Partial<Scene>);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Scene settings</h2>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            editing · {locale.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{COMPOSITION_HINT[scene.composition]}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Composition</Label>
          <Select
            value={scene.composition}
            onValueChange={(value) => {
              const next = value as Composition;
              onChange({
                composition: next,
                boxes: undefined,
                captureEcho: next === "stacked-pair" ? scene.captureEcho || scene.capture : undefined,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPOSITION_ORDER.map((composition) => (
                <SelectItem key={composition} value={composition}>
                  {COMPOSITION_NAME[composition]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isBanner && (
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input
              value={localeLabel}
              onChange={(e) => writeField("label", e.target.value)}
              placeholder={labelPlaceholder}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs">{isBanner ? "Tagline" : "Headline"}</Label>
            <span className="text-[10px] text-muted-foreground">newline = break</span>
          </div>
          <Textarea
            value={localeHeadline}
            onChange={(e) => writeField("headline", e.target.value)}
            rows={3}
            placeholder={headlinePlaceholder}
          />
        </div>

        {!isBanner && !isTypeOnly && (
          <div className="space-y-1.5">
            <Label className="text-xs">
              {scene.composition === "stacked-pair" ? "Front device capture" : "Capture"}
            </Label>
            <MediaDropField
              label="Primary"
              value={scene.capture}
              onChange={(value) => onChange({ capture: value })}
            />
          </div>
        )}

        {scene.composition === "stacked-pair" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Back device capture</Label>
            <MediaDropField
              label="Secondary (back layer)"
              value={scene.captureEcho || ""}
              onChange={(value) => onChange({ captureEcho: value })}
            />
          </div>
        )}

        {!isBanner && <BoxControls scene={scene} selectedKey={selectedKey} onChange={onChange} />}

        {isBanner && (
          <p className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Shows the product icon + name + tagline. Set an icon path in the toolbar (or leave it
            blank to use the product initial). The name comes from the command bar.
          </p>
        )}
      </div>
    </div>
  );
}

function BoxControls({
  scene,
  selectedKey,
  onChange,
}: {
  scene: Scene;
  selectedKey: ElementKey | null;
  onChange: (patch: Partial<Scene>) => void;
}) {
  const present: ElementKey[] = ["copy"];
  if (scene.composition !== "type-only") present.push("screen");
  if (scene.composition === "stacked-pair") present.push("screenEcho");

  const boxes = scene.boxes || {};
  const activeKey = selectedKey && present.includes(selectedKey) ? selectedKey : null;

  function patchBox(key: ElementKey, patch: Partial<BoxTransform>) {
    const current = boxes[key];
    if (!current) return; // only adjustable once the user has moved/resized it
    onChange({ boxes: { ...boxes, [key]: { ...current, ...patch } } });
  }

  // Re-rank zIndex among present elements so they stay contiguous.
  function restack(key: ElementKey, dir: "front" | "back" | "up" | "down") {
    const ordered = [...present].sort(
      (a, b) => (boxes[a]?.zIndex ?? defaultZ(a)) - (boxes[b]?.zIndex ?? defaultZ(b)),
    );
    const at = ordered.indexOf(key);
    if (at === -1) return;
    let target = at;
    if (dir === "front") target = ordered.length - 1;
    else if (dir === "back") target = 0;
    else if (dir === "up") target = Math.min(ordered.length - 1, at + 1);
    else if (dir === "down") target = Math.max(0, at - 1);
    if (target === at) return;
    ordered.splice(at, 1);
    ordered.splice(target, 0, key);
    const next = { ...boxes };
    ordered.forEach((k, i) => {
      const cur = next[k];
      if (!cur) return;
      next[k] = { ...cur, zIndex: i + 1 };
    });
    onChange({ boxes: next });
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div>
        <Label className="text-xs font-semibold">Elements</Label>
        <p className="text-[11px] text-muted-foreground">
          {activeKey
            ? "Fine-tune the selected element's rotation and stacking."
            : "Click an element on the stage to fine-tune its rotation and stacking."}
        </p>
      </div>

      {activeKey ? (
        <ActiveBoxPanel
          activeKey={activeKey}
          box={boxes[activeKey]}
          onRotate={(rotation) => patchBox(activeKey, { rotation })}
          onRestack={(dir) => restack(activeKey, dir)}
        />
      ) : (
        <div className="rounded border border-dashed bg-background/40 p-4 text-center text-[11px] text-muted-foreground">
          No element selected
        </div>
      )}
    </div>
  );
}

function ActiveBoxPanel({
  activeKey,
  box,
  onRotate,
  onRestack,
}: {
  activeKey: ElementKey;
  box: BoxTransform | undefined;
  onRotate: (rotation: number) => void;
  onRestack: (dir: "front" | "back" | "up" | "down") => void;
}) {
  const engaged = !!box;
  const rotation = box?.rotation ?? 0;
  const name = ELEMENT_NAME[activeKey];

  return (
    <div className="space-y-2 rounded border bg-background/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{name}</span>
        {!engaged && <span className="text-[10px] text-muted-foreground">drag to enable</span>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <RotateCw className="h-3 w-3" /> Rotation
          </Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">{rotation}°</span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          disabled={!engaged}
          onChange={(e) => onRotate(Number(e.target.value))}
          className="w-full disabled:opacity-50"
          aria-label={`${name} rotation`}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Layer</Label>
        <div className="grid grid-cols-4 gap-1">
          <StackButton disabled={!engaged} onClick={() => onRestack("back")} label="Send to back">
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </StackButton>
          <StackButton disabled={!engaged} onClick={() => onRestack("down")} label="Send backward">
            <ChevronDown className="h-3.5 w-3.5" />
          </StackButton>
          <StackButton disabled={!engaged} onClick={() => onRestack("up")} label="Bring forward">
            <ChevronUp className="h-3.5 w-3.5" />
          </StackButton>
          <StackButton disabled={!engaged} onClick={() => onRestack("front")} label="Bring to front">
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </StackButton>
        </div>
      </div>
    </div>
  );
}

function StackButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      tone="outline"
      scale="sm"
      className="h-7 px-0"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  );
}
