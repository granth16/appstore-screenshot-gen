"use client";
import * as React from "react";
import {
  AlertTriangle,
  Check,
  Cloud,
  RectangleHorizontal,
  RectangleVertical,
  Redo2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SURFACE_NAME } from "@/domain/surfaces";
import type { StageOrientation, Surface } from "@/domain/types";
import { relativeSince } from "@/utils/format";
import { cn } from "@/utils/cn";

type Props = {
  surface: Surface;
  composition?: string;
  orientation: StageOrientation;
  setOrientation: (value: StageOrientation) => void;
  hasLandscape: boolean;
  locale: string;
  locales: string[];
  setLocale: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  savedAt: number | null;
  saveError: string | null;
  busy: boolean;
};

// A slim bar scoped to the canvas workspace (not a global app toolbar). History,
// the breadcrumb, orientation, locale, save state and export live here.
export function CanvasHeader(props: Props) {
  const surfaceName = SURFACE_NAME[props.surface];

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/70 px-3 backdrop-blur">
      <div className="flex items-center gap-0.5">
        <Button
          tone="quiet"
          scale="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={props.onUndo}
          disabled={props.busy}
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          tone="quiet"
          scale="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={props.onRedo}
          disabled={props.busy}
          title="Redo (⌘⇧Z)"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <span aria-hidden className="h-5 w-px bg-border" />

      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="truncate font-medium">{surfaceName}</span>
        {props.composition && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="truncate text-muted-foreground">{props.composition}</span>
          </>
        )}
      </div>

      {props.hasLandscape && (
        <Button
          tone="soft"
          scale="sm"
          className="h-8 gap-1.5"
          onClick={() =>
            props.setOrientation(props.orientation === "portrait" ? "landscape" : "portrait")
          }
          disabled={props.busy}
          title="Toggle orientation"
        >
          {props.orientation === "portrait" ? (
            <RectangleVertical className="h-4 w-4" />
          ) : (
            <RectangleHorizontal className="h-4 w-4" />
          )}
          <span className="text-xs capitalize">{props.orientation}</span>
        </Button>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {props.locales.length > 1 && (
          <Select value={props.locale} onValueChange={props.setLocale} disabled={props.busy}>
            <SelectTrigger className="h-8 w-[68px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {props.locales.map((l) => (
                <SelectItem key={l} value={l}>
                  {l.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <SaveBadge savedAt={props.savedAt} saveError={props.saveError} />
      </div>
    </header>
  );
}

function SaveBadge({ savedAt, saveError }: { savedAt: number | null; saveError: string | null }) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const cls = "flex items-center gap-1 text-xs";
  if (saveError) {
    return (
      <span className={cn(cls, "text-destructive")} title={saveError}>
        <AlertTriangle className="h-3.5 w-3.5" /> save failed
      </span>
    );
  }
  if (!savedAt) {
    return (
      <span className={cn(cls, "text-muted-foreground")}>
        <Cloud className="h-3.5 w-3.5" /> not saved yet
      </span>
    );
  }
  return (
    <span className={cn(cls, "text-muted-foreground")}>
      <Check className="h-3.5 w-3.5 text-emerald-500" /> {relativeSince(savedAt)}
    </span>
  );
}
