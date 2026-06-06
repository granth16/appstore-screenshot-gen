"use client";
import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onExport: () => void;
  exporting: string | null;
  localeCount: number;
  sizeCount: number;
  busy: boolean;
};

// The primary export action lives pinned to the foot of the left column (not as
// a top-right toolbar button).
export function ExportFooter({ onExport, exporting, localeCount, sizeCount, busy }: Props) {
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  return (
    <div className="shrink-0 border-t border-border p-3">
      <Button
        onClick={onExport}
        disabled={busy}
        scale="lg"
        className="h-11 w-full justify-center gap-2 text-sm font-semibold"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Rendering {exporting}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export this surface
          </>
        )}
      </Button>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        {plural(localeCount, "locale")} × {plural(sizeCount, "size")} → zip of PNGs
      </p>
    </div>
  );
}
