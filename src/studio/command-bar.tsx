"use client";
import * as React from "react";
import { AlertTriangle, Check, Cloud, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allowsLandscape, storeFor, SURFACE_NAME, SURFACES_BY_STORE } from "@/domain/surfaces";
import type { StageOrientation, Store, Surface } from "@/domain/types";
import { relativeSince } from "@/utils/format";

type Props = {
  productName: string;
  setProductName: (value: string) => void;
  locale: string;
  setLocale: (value: string) => void;
  locales: string[];
  surface: Surface;
  setSurface: (value: Surface) => void;
  orientation: StageOrientation;
  setOrientation: (value: StageOrientation) => void;
  onExport: () => void;
  onResetAll: () => void;
  onResetSurface: () => void;
  exporting: string | null;
  savedAt: number | null;
  saveError: string | null;
  busy: boolean;
};

const STORE_NAME: Record<Store, string> = {
  apple: "App Store",
  google: "Google Play",
};

export function CommandBar(props: Props) {
  const store = storeFor(props.surface);
  const hasLandscape = allowsLandscape(props.surface);
  const [confirmReset, setConfirmReset] = React.useState(false);

  // Remember the last surface chosen per store so switching tabs returns there.
  const lastByStore = React.useRef<Record<Store, Surface>>({
    apple: store === "apple" ? props.surface : "ios-phone",
    google: store === "google" ? props.surface : "play-phone",
  });
  React.useEffect(() => {
    lastByStore.current[store] = props.surface;
  }, [store, props.surface]);

  const showLocale = props.locales.length > 1;
  const surfaceName = SURFACE_NAME[props.surface];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b bg-card/40 px-4 py-2">
      <Input
        value={props.productName}
        onChange={(e) => props.setProductName(e.target.value)}
        className="h-8 w-40 border-dashed text-sm font-semibold focus-visible:border-input focus-visible:border-solid focus-visible:bg-background"
        placeholder="Product name"
        aria-label="Product name"
        title="Product name (click to edit)"
        disabled={props.busy}
      />

      <span aria-hidden className="mx-1 h-5 w-px bg-border" />

      <Tabs
        value={store}
        onValueChange={(value) => {
          if (props.busy) return;
          props.setSurface(lastByStore.current[value as Store]);
        }}
      >
        <TabsList className="h-8 p-0.5">
          <TabsTrigger value="apple" className="h-7 px-3 text-xs" disabled={props.busy}>
            App Store
          </TabsTrigger>
          <TabsTrigger value="google" className="h-7 px-3 text-xs" disabled={props.busy}>
            Google Play
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        value={props.surface}
        onValueChange={(value) => props.setSurface(value as Surface)}
        disabled={props.busy}
      >
        <SelectTrigger className="h-8 w-48 text-xs">
          <SelectValue placeholder="Surface">{surfaceName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SURFACES_BY_STORE[store].map((s) => (
            <SelectItem key={s} value={s}>
              {SURFACE_NAME[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasLandscape && (
        <Select
          value={props.orientation}
          onValueChange={(value) => props.setOrientation(value as StageOrientation)}
          disabled={props.busy}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showLocale && (
        <Select value={props.locale} onValueChange={props.setLocale} disabled={props.busy}>
          <SelectTrigger className="h-8 w-20 text-xs">
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

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <SaveBadge savedAt={props.savedAt} saveError={props.saveError} />
        <span aria-hidden className="h-5 w-px bg-border" />
        <Button
          tone="quiet"
          scale="icon"
          className="h-8 w-8"
          onClick={() => setConfirmReset(true)}
          title="Reset scenes to defaults"
          aria-label="Reset"
          disabled={props.busy}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          onClick={props.onExport}
          disabled={!!props.exporting}
          scale="sm"
          className="h-8"
          title={`Export every size × locale for this ${STORE_NAME[store]} surface as a zip`}
        >
          <Download className="h-4 w-4" />
          {props.exporting ? `Exporting ${props.exporting}` : "Export bundle"}
        </Button>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to defaults?</DialogTitle>
            <DialogDescription>
              Reset just <span className="font-medium">{surfaceName}</span> or every surface. Your
              edits, uploaded captures, and copy will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button tone="quiet" scale="sm" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              tone="outline"
              scale="sm"
              onClick={() => {
                setConfirmReset(false);
                props.onResetSurface();
              }}
            >
              Reset {surfaceName} only
            </Button>
            <Button
              tone="danger"
              scale="sm"
              onClick={() => {
                setConfirmReset(false);
                props.onResetAll();
              }}
            >
              Reset all surfaces
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaveBadge({ savedAt, saveError }: { savedAt: number | null; saveError: string | null }) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (saveError) {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive" title={saveError}>
        <AlertTriangle className="h-3.5 w-3.5" /> save failed
      </span>
    );
  }
  if (!savedAt) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3.5 w-3.5" /> not saved yet
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5 text-emerald-500" /> {relativeSince(savedAt)}
    </span>
  );
}
