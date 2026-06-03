import JSZip from "jszip";
import { toPng } from "html-to-image";
import { canvasSize, outputSizesFor, storeFor } from "@/domain/surfaces";
import type { Scene, StageOrientation, Surface } from "@/domain/types";
import { compactTimestamp, toSlug } from "@/utils/format";

// Two RAFs so React's render → browser layout/paint of the off-screen node has
// settled before html-to-image snapshots it. One frame is occasionally short
// on slower machines.
const nextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

// Snapshot a node at an exact pixel size. We move it to the origin and scale it
// uniformly so the captured buffer matches the requested size, then restore the
// styles we touched.
async function captureNode(node: HTMLElement, w: number, h: number, scale: number): Promise<string> {
  const saved = {
    left: node.style.left,
    top: node.style.top,
    position: node.style.position,
    transform: node.style.transform,
    transformOrigin: node.style.transformOrigin,
    zIndex: node.style.zIndex,
  };
  node.style.left = "0px";
  node.style.top = "0px";
  node.style.position = "absolute";
  node.style.transform = `scale(${scale})`;
  node.style.transformOrigin = "top left";
  node.style.zIndex = "-1";
  try {
    return await toPng(node, { width: w, height: h, pixelRatio: 1, cacheBust: false });
  } finally {
    node.style.left = saved.left || "-99999px";
    node.style.top = saved.top || "0px";
    node.style.position = saved.position || "absolute";
    node.style.transform = saved.transform;
    node.style.transformOrigin = saved.transformOrigin;
    node.style.zIndex = saved.zIndex;
  }
}

export type DeckExportParams = {
  scenes: Scene[];
  surface: Surface;
  orientation: StageOrientation;
  locales: string[];
  productName: string;
  nodeFor: (sceneId: string) => HTMLElement | null | undefined;
  onProgress: (label: string | null) => void;
  onLocale: (locale: string | null) => void;
};

export type DeckExportResult = {
  ok: number;
  failed: number;
  total: number;
  sizeCount: number;
  localeCount: number;
  errors: string[];
  downloaded: boolean;
};

// Walk every locale × size × scene for a surface, render PNGs, and bundle them
// into a downloaded zip. Returns a summary for the caller to surface as toasts.
export async function runDeckExport(p: DeckExportParams): Promise<DeckExportResult> {
  const sizes = outputSizesFor(p.surface, p.orientation);
  const { w: canvasW, h: canvasH } = canvasSize(p.surface, p.orientation);
  const store = storeFor(p.surface);
  const zip = new JSZip();

  const total = sizes.length * p.locales.length * p.scenes.length;
  let done = 0;
  let ok = 0;
  let failed = 0;
  const errors: string[] = [];

  // Ensure fonts are ready so exported typography matches the screen.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  for (const locale of p.locales) {
    p.onLocale(locale);
    await nextPaint();

    for (const size of sizes) {
      // Uniform downscale so smaller targets shrink rather than crop.
      const scale = Math.min(size.w / canvasW, size.h / canvasH);

      for (let i = 0; i < p.scenes.length; i++) {
        const scene = p.scenes[i];
        done += 1;
        p.onProgress(`${done}/${total}`);

        const node = p.nodeFor(scene.id);
        if (!node) {
          failed += 1;
          errors.push(`${locale} ${size.w}x${size.h} scene ${i + 1}: render target missing`);
          continue;
        }
        try {
          const dataUrl = await captureNode(node, size.w, size.h, scale);
          const base64 = dataUrl.split(",")[1] || "";
          const filename = `${String(i + 1).padStart(2, "0")}-${scene.composition}.png`;
          zip.file(`${store}/${p.surface}/${size.w}x${size.h}/${locale}/${filename}`, base64, {
            base64: true,
          });
          ok += 1;
        } catch (e) {
          failed += 1;
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`${locale} ${size.w}x${size.h} scene ${i + 1}: ${msg}`);
          console.error("Export failed", { sceneId: scene.id, locale, size }, e);
        }
      }
    }
  }

  p.onLocale(null);
  p.onProgress(null);

  let downloaded = false;
  if (ok > 0) {
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${toSlug(p.productName)}-${store}-${p.surface}-${compactTimestamp()}.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    downloaded = true;
  }

  return {
    ok,
    failed,
    total,
    sizeCount: sizes.length,
    localeCount: p.locales.length,
    errors,
    downloaded,
  };
}
