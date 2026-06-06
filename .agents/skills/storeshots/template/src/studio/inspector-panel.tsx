"use client";
import * as React from "react";
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/utils/cn";
import { baseLayer } from "./canvas/blueprints";
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

// A two-column property row: caption on the left, control on the right. This
// replaces the usual stacked "label over input" form pattern.
function Field({
  label,
  hint,
  alignTop,
  children,
}: {
  label: string;
  hint?: string;
  alignTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[72px_minmax(0,1fr)] gap-x-3",
        alignTop ? "items-start" : "items-center",
      )}
    >
      <div className={cn("text-right", alignTop && "pt-2")}>
        <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
        {hint && <div className="text-[9px] leading-tight text-muted-foreground/60">{hint}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function InspectorPanel({ scene, locale, selectedKey, onChange }: Props) {
  const isBanner = scene.composition === "marquee";
  const isTypeOnly = scene.composition === "manifesto";
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
      <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Frame · {locale.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 pt-1">
        <Field label="Layout">
          <Select
            value={scene.composition}
            onValueChange={(value) => {
              const next = value as Composition;
              onChange({
                composition: next,
                boxes: undefined,
                captureEcho: next === "duet" ? scene.captureEcho || scene.capture : undefined,
              });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
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
        </Field>

        <p className="pl-[84px] text-[10px] leading-snug text-muted-foreground/70">
          {COMPOSITION_HINT[scene.composition]}
        </p>

        <SectionTitle>Copy</SectionTitle>

        {!isBanner && (
          <Field label="Eyebrow">
            <Input
              value={localeLabel}
              onChange={(e) => writeField("label", e.target.value)}
              placeholder={labelPlaceholder}
              className="h-8 text-xs"
            />
          </Field>
        )}

        <Field label={isBanner ? "Tagline" : "Headline"} hint="newline = break" alignTop>
          <Textarea
            value={localeHeadline}
            onChange={(e) => writeField("headline", e.target.value)}
            rows={3}
            placeholder={headlinePlaceholder}
            className="text-xs"
          />
        </Field>

        {!isBanner && !isTypeOnly && (
          <>
            <SectionTitle>Artwork</SectionTitle>
            <MediaDropField
              label={scene.composition === "duet" ? "Front capture" : "Capture"}
              value={scene.capture}
              onChange={(value) => onChange({ capture: value })}
            />
            {scene.composition === "duet" && (
              <MediaDropField
                label="Back capture"
                value={scene.captureEcho || ""}
                onChange={(value) => onChange({ captureEcho: value })}
              />
            )}
          </>
        )}

        {!isBanner && <BoxControls scene={scene} selectedKey={selectedKey} onChange={onChange} />}

        {isBanner && (
          <p className="rounded-md border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Renders the product icon, name and tagline. The name comes from the Project panel; leave
            the icon blank to fall back to the product&apos;s initial.
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
  if (scene.composition !== "manifesto") present.push("screen");
  if (scene.composition === "duet") present.push("screenEcho");

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
      (a, b) => (boxes[a]?.zIndex ?? baseLayer(a)) - (boxes[b]?.zIndex ?? baseLayer(b)),
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
    <>
      <SectionTitle>Selection</SectionTitle>
      {activeKey ? (
        <ActiveBoxPanel
          activeKey={activeKey}
          box={boxes[activeKey]}
          onRotate={(rotation) => patchBox(activeKey, { rotation })}
          onRestack={(dir) => restack(activeKey, dir)}
        />
      ) : (
        <p className="rounded-md border border-dashed bg-background/40 px-3 py-4 text-center text-[11px] text-muted-foreground">
          Click an element on the stage to adjust its rotation and stacking.
        </p>
      )}
    </>
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
    <div className="space-y-2 rounded-md border bg-background/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{name}</span>
        {!engaged && <span className="text-[10px] text-muted-foreground">drag to enable</span>}
      </div>

      <Field label={`${rotation}°`}>
        <div className="flex items-center gap-2">
          <RotateCw className="h-3 w-3 shrink-0 text-muted-foreground" />
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
      </Field>

      <Field label="Layer">
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
      </Field>
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
