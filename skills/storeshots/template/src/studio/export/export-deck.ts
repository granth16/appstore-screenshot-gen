import JSZip from "jszip";
import { toPng } from "html-to-image";
import { canvasSize, outputSizesFor, storeFor } from "@/domain/surfaces";
import type { Scene, StageOrientation, Surface } from "@/domain/types";
import { compactTimestamp, toSlug } from "@/utils/format";

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

// Give the browser a couple of frames to commit a render before we rasterize.
// Mounting the off-screen frames (or switching the export locale) mutates the
// DOM, and html-to-image only captures what has actually been painted.
async function settleLayout() {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
}

// Rasterize a single off-screen frame to base64 PNG bytes. Instead of editing
// the live node and putting it back, we hand html-to-image a one-shot style
// override for its clone: pin it to the origin and scale it into the target box.
async function frameToPng(
  node: HTMLElement,
  width: number,
  height: number,
  scale: number,
): Promise<string> {
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: false,
    style: {
      margin: "0",
      left: "0",
      top: "0",
      position: "static",
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    },
  });
  return dataUrl.split(",")[1] ?? "";
}

type ExportJob = {
  locale: string;
  size: { w: number; h: number };
  scene: Scene;
  order: number;
};

export async function runDeckExport(p: DeckExportParams): Promise<DeckExportResult> {
  const sizes = outputSizesFor(p.surface, p.orientation);
  const { w: baseW, h: baseH } = canvasSize(p.surface, p.orientation);
  const store = storeFor(p.surface);

  // Flatten the locale × size × frame matrix into one ordered work list. Keeping
  // locale as the outer grouping means the stage is only re-rendered once per
  // language instead of for every size.
  const jobs: ExportJob[] = [];
  for (const locale of p.locales) {
    for (const size of sizes) {
      p.scenes.forEach((scene, order) => jobs.push({ locale, size, scene, order }));
    }
  }

  // Wait for webfonts up front so exported glyphs match the on-screen stage.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts API is best-effort */
    }
  }

  const zip = new JSZip();
  const errors: string[] = [];
  let ok = 0;
  let failed = 0;
  let activeLocale: string | null = null;

  for (let i = 0; i < jobs.length; i++) {
    const { locale, size, scene, order } = jobs[i];

    if (locale !== activeLocale) {
      activeLocale = locale;
      p.onLocale(locale);
      await settleLayout();
    }

    p.onProgress(`${i + 1}/${jobs.length}`);

    const tag = `${locale} ${size.w}x${size.h} frame ${order + 1}`;
    const node = p.nodeFor(scene.id);
    if (!node) {
      failed += 1;
      errors.push(`${tag}: render target missing`);
      continue;
    }

    try {
      const scale = Math.min(size.w / baseW, size.h / baseH);
      const base64 = await frameToPng(node, size.w, size.h, scale);
      const name = `frame-${String(order + 1).padStart(2, "0")}-${scene.composition}.png`;
      zip.file(`${store}/${p.surface}/${locale}/${size.w}x${size.h}/${name}`, base64, {
        base64: true,
      });
      ok += 1;
    } catch (e) {
      failed += 1;
      errors.push(`${tag}: ${e instanceof Error ? e.message : String(e)}`);
      console.error("Frame export failed", { sceneId: scene.id, locale, size }, e);
    }
  }

  p.onLocale(null);
  p.onProgress(null);

  let downloaded = false;
  if (ok > 0) {
    const blob = await zip.generateAsync({ type: "blob" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${toSlug(p.productName)}-${store}-${p.surface}-${compactTimestamp()}.zip`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 5000);
    downloaded = true;
  }

  return {
    ok,
    failed,
    total: jobs.length,
    sizeCount: sizes.length,
    localeCount: p.locales.length,
    errors,
    downloaded,
  };
}
