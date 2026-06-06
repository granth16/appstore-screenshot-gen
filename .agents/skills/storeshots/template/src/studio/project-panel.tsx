"use client";
import * as React from "react";
import { Apple, Play, RotateCcw } from "lucide-react";
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
} from "@/components/ui/select";
import { SURFACE_NAME, SURFACE_ORDER, storeFor } from "@/domain/surfaces";
import type { Surface } from "@/domain/types";

type Props = {
  productName: string;
  setProductName: (value: string) => void;
  surface: Surface;
  setSurface: (value: Surface) => void;
  surfaceName: string;
  onResetAll: () => void;
  onResetSurface: () => void;
  busy: boolean;
};

function StoreGlyph({ surface, className }: { surface: Surface; className?: string }) {
  const Icon = storeFor(surface) === "apple" ? Apple : Play;
  return <Icon className={className} />;
}

// Document-level controls. There is no separate App Store / Google Play switch —
// every surface (from either store) lives in one unified picker, with a store
// glyph for context.
export function ProjectPanel({
  productName,
  setProductName,
  surface,
  setSurface,
  surfaceName,
  onResetAll,
  onResetSurface,
  busy,
}: Props) {
  const [confirmReset, setConfirmReset] = React.useState(false);

  return (
    <div className="shrink-0 border-b border-border">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-foreground text-sm font-black leading-none shadow-sm"
          >
            S
          </span>
          <span className="select-none text-sm font-semibold tracking-tight">StoreShots</span>
        </div>
        <Button
          tone="quiet"
          scale="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => setConfirmReset(true)}
          disabled={busy}
          title="Reset to defaults"
          aria-label="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-2 px-3 pb-3">
        <Select value={surface} onValueChange={(v) => setSurface(v as Surface)} disabled={busy}>
          <SelectTrigger className="h-9 text-sm">
            <span className="!flex min-w-0 items-center gap-2">
              <StoreGlyph surface={surface} className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{surfaceName}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {SURFACE_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2">
                  <StoreGlyph surface={s} className="h-3.5 w-3.5 text-muted-foreground" />
                  {SURFACE_NAME[s]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product name"
          aria-label="Product name"
          disabled={busy}
          className="h-9 text-sm font-semibold"
        />
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
                onResetSurface();
              }}
            >
              Reset {surfaceName} only
            </Button>
            <Button
              tone="danger"
              scale="sm"
              onClick={() => {
                setConfirmReset(false);
                onResetAll();
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
