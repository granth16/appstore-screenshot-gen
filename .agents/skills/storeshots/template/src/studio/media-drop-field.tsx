"use client";
import * as React from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { asset, assetBroken, cacheAsset } from "@/runtime/asset-cache";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_BYTES = 8 * 1024 * 1024;

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function persistToDisk(dataUri: string): Promise<string | null> {
  try {
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUri }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { ok: boolean; path?: string };
    return json.ok && json.path ? json.path : null;
  } catch {
    return null;
  }
}

// A drag-and-drop / click-to-pick image field. Uploads persist to disk so they
// survive a clone; if the endpoint is unreachable it falls back to an inline
// data URI that still works for the session.
export function MediaDropField({ label, value, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function ingest(file: File) {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use PNG or JPG (stores reject other formats)");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image too large (>8MB)");
      return;
    }
    let dataUri: string;
    try {
      dataUri = await readAsDataUri(file);
    } catch {
      setError("Failed to read file");
      return;
    }
    setBusy(true);
    const diskPath = await persistToDisk(dataUri);
    setBusy(false);
    if (diskPath) {
      cacheAsset(diskPath, dataUri);
      onChange(diskPath);
    } else {
      cacheAsset(dataUri, dataUri);
      onChange(dataUri);
    }
  }

  const filled = !!value;
  const inline = filled && value.startsWith("data:");
  const previewSrc = inline ? value : filled ? asset(value) : "";
  const missing = filled && !inline && assetBroken(value);
  const caption = busy
    ? "saving…"
    : !filled
      ? "drop image, or click Pick"
      : inline
        ? "uploaded image (not on disk)"
        : value.replace(/^.*\/(?=[^/]+\/[^/]+$)/, "…/");

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-3 rounded-md border p-2 transition-colors ${
          over ? "border-primary bg-accent ring-2 ring-primary/30" : "border-input"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!over) setOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setOver(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) await ingest(file);
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
              onError={() => setError("Image failed to load")}
            />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-medium">{label}</span>
          <span className="truncate text-[10px] text-muted-foreground">
            {over ? "Drop to upload" : caption}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={async (e) => {
            const el = e.currentTarget;
            const file = el.files?.[0];
            if (file) await ingest(file);
            el.value = "";
          }}
        />
        <Button type="button" tone="outline" scale="sm" className="h-8" onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          Pick
        </Button>
        {filled && (
          <Button
            type="button"
            tone="quiet"
            scale="icon"
            className="h-8 w-8"
            onClick={() => {
              onChange("");
              setError(null);
            }}
            aria-label="Clear capture"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : missing ? (
        <p className="text-[11px] text-destructive">Image not found at {value}</p>
      ) : null}
    </div>
  );
}
