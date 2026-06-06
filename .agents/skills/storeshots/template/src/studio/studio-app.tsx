"use client";
import * as React from "react";
import { Toaster, toast } from "sonner";
import { COMPOSITION_NAME } from "@/domain/compositions";
import { PALETTES } from "@/domain/palettes";
import { allowsLandscape, canvasSize, outputSizesFor, SURFACE_NAME } from "@/domain/surfaces";
import type { BoxTransform, ElementKey, Scene } from "@/domain/types";
import { warmAssets } from "@/runtime/asset-cache";
import { uid } from "@/state/seed";
import { useStudioDoc } from "@/state/use-studio-doc";
import { editCopy, expandCapturePath } from "@/text/copy";
import { SceneRenderer } from "./canvas/scene-renderer";
import { CanvasHeader } from "./canvas-header";
import { ExportFooter } from "./export-footer";
import { runDeckExport } from "./export/export-deck";
import { useStudioHotkeys } from "./hooks/use-hotkeys";
import { InspectorPanel } from "./inspector-panel";
import { ProjectPanel } from "./project-panel";
import { SceneRail } from "./scene-rail";
import { StageViewport } from "./stage-viewport";

export function StudioApp() {
  const { doc, commit, hydrated, savedAt, saveError, resetAll, resetSurface, undo, redo } =
    useStudioDoc();
  const [activeSceneId, setActiveSceneId] = React.useState<string | null>(null);
  const [selectedKey, setSelectedKey] = React.useState<ElementKey | null>(null);
  const [exporting, setExporting] = React.useState<string | null>(null);
  const [assetsReady, setAssetsReady] = React.useState(false);
  const [exportLocale, setExportLocale] = React.useState<string | null>(null);
  const exportNodes = React.useRef<Record<string, HTMLDivElement | null>>({});

  const scenes = doc.scenesBySurface[doc.surface] || [];
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0] || null;
  const palette = PALETTES[doc.paletteId];

  React.useEffect(() => {
    setSelectedKey(null);
  }, [activeScene?.id]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!activeScene && scenes.length > 0) setActiveSceneId(scenes[0].id);
  }, [hydrated, scenes, activeScene]);

  // Tablets only — drop landscape if the surface doesn't support it.
  React.useEffect(() => {
    const tablet = doc.surface === "play-tablet-7" || doc.surface === "play-tablet-10";
    if (!tablet && doc.orientation !== "portrait") {
      commit((d) => ({ ...d, orientation: "portrait" }));
    }
  }, [doc.surface, doc.orientation, commit]);

  // Collect every asset path (across surfaces + locales) so bulk export never
  // races an image load.
  const assetPaths = React.useMemo(() => {
    const set = new Set<string>();
    if (doc.productIcon) set.add(doc.productIcon);
    const everyScene: Scene[] = Object.values(doc.scenesBySurface).flat();
    for (const s of everyScene) {
      for (const path of [s.capture, s.captureEcho]) {
        if (!path || path.startsWith("data:")) continue;
        if (path.includes("{locale}")) {
          for (const loc of doc.locales) set.add(expandCapturePath(path, loc));
        } else {
          set.add(path);
        }
      }
    }
    return Array.from(set).sort();
  }, [doc.scenesBySurface, doc.productIcon, doc.locales]);
  const assetSignature = assetPaths.join("|");

  React.useEffect(() => {
    if (!hydrated) return;
    warmAssets(assetPaths).finally(() => setAssetsReady(true));
    // assetPaths is derived from assetSignature; depending on the string keeps
    // this from re-firing when decks churn without path changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, assetSignature]);

  React.useEffect(() => {
    if (saveError) {
      toast.error("Couldn't save changes locally", { description: saveError, duration: 8000 });
    }
  }, [saveError]);

  // ---------- mutations ----------

  const patchScene = React.useCallback(
    (id: string, patch: Partial<Scene>) => {
      commit((d) => ({
        ...d,
        scenesBySurface: {
          ...d.scenesBySurface,
          [d.surface]: (d.scenesBySurface[d.surface] || []).map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        },
      }));
    },
    [commit],
  );

  const reorderScenes = React.useCallback(
    (next: Scene[]) => {
      commit((d) => ({ ...d, scenesBySurface: { ...d.scenesBySurface, [d.surface]: next } }));
    },
    [commit],
  );

  const addScene = React.useCallback(
    (scene: Scene) => {
      commit((d) => ({
        ...d,
        scenesBySurface: {
          ...d.scenesBySurface,
          [d.surface]: [...(d.scenesBySurface[d.surface] || []), scene],
        },
      }));
      setActiveSceneId(scene.id);
    },
    [commit],
  );

  const duplicateScene = React.useCallback(
    (id: string) => {
      let createdId: string | null = null;
      commit((d) => {
        const list = d.scenesBySurface[d.surface] || [];
        const at = list.findIndex((s) => s.id === id);
        if (at === -1) return d;
        createdId = uid();
        const copy: Scene = { ...list[at], id: createdId };
        const next = [...list.slice(0, at + 1), copy, ...list.slice(at + 1)];
        return { ...d, scenesBySurface: { ...d.scenesBySurface, [d.surface]: next } };
      });
      if (createdId) setActiveSceneId(createdId);
    },
    [commit],
  );

  const deleteScene = React.useCallback(
    (id: string) => {
      const surface = doc.surface;
      const list = doc.scenesBySurface[surface] || [];
      const at = list.findIndex((s) => s.id === id);
      if (at === -1) return;
      const removed = list[at];
      const neighbour = list[at + 1] || list[at - 1] || null;

      commit((d) => {
        const cur = d.scenesBySurface[surface] || [];
        return {
          ...d,
          scenesBySurface: { ...d.scenesBySurface, [surface]: cur.filter((s) => s.id !== id) },
        };
      });
      setActiveSceneId((cur) => (cur === id ? neighbour?.id || null : cur));
      delete exportNodes.current[id];

      toast("Scene deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            commit((d) => {
              const cur = d.scenesBySurface[surface] || [];
              if (cur.some((s) => s.id === removed.id)) return d;
              const restored = [...cur.slice(0, at), removed, ...cur.slice(at)];
              return {
                ...d,
                scenesBySurface: { ...d.scenesBySurface, [surface]: restored },
              };
            });
            setActiveSceneId(removed.id);
          },
        },
        duration: 6000,
      });
    },
    [commit, doc.surface, doc.scenesBySurface],
  );

  const writeLocalizedField = React.useCallback(
    (scene: Scene, key: "label" | "headline", value: string) => {
      patchScene(scene.id, { [key]: editCopy(scene[key], doc.locale, value) } as Partial<Scene>);
    },
    [patchScene, doc.locale],
  );

  // ---------- keyboard ----------

  useStudioHotkeys({
    enabled: !exporting,
    scenes,
    activeId: activeScene?.id || null,
    select: setActiveSceneId,
    deselect: () => setSelectedKey(null),
    undo,
    redo,
    duplicate: duplicateScene,
    remove: deleteScene,
  });

  // ---------- export ----------

  async function exportBundle() {
    if (!scenes.length) {
      toast.error("No scenes to export");
      return;
    }
    const result = await runDeckExport({
      scenes,
      surface: doc.surface,
      orientation: doc.orientation,
      locales: doc.locales,
      productName: doc.productName,
      nodeFor: (id) => exportNodes.current[id],
      onProgress: setExporting,
      onLocale: setExportLocale,
    });

    const summary =
      `${result.localeCount} locale${result.localeCount === 1 ? "" : "s"} × ` +
      `${result.sizeCount} size${result.sizeCount === 1 ? "" : "s"}`;

    if (result.failed === 0 && result.ok > 0) {
      toast.success(`Exported ${result.ok} PNGs (${summary})`);
    } else if (result.ok === 0) {
      toast.error(`All ${result.failed} renders failed`, {
        description: result.errors.slice(0, 3).join("\n"),
      });
    } else {
      toast.error(`${result.failed} of ${result.total} renders failed`, {
        description: result.errors.slice(0, 3).join("\n"),
      });
    }
  }

  // ---------- render ----------

  if (!hydrated || !assetsReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm">Preparing studio…</p>
        </div>
      </div>
    );
  }

  const { w: canvasW, h: canvasH } = canvasSize(doc.surface, doc.orientation);
  const busy = !!exporting;
  const setSurface = (v: typeof doc.surface) => commit((d) => ({ ...d, surface: v }));
  const surfaceName = SURFACE_NAME[doc.surface];
  const sizeCount = outputSizesFor(doc.surface, doc.orientation).length;

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <Toaster position="top-right" richColors closeButton />

      <aside className="absolute bottom-4 left-4 top-4 z-20 flex w-72 flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur md:w-80">
        <ProjectPanel
          productName={doc.productName}
          setProductName={(v) => commit((d) => ({ ...d, productName: v }))}
          surface={doc.surface}
          setSurface={setSurface}
          surfaceName={surfaceName}
          onResetAll={() => {
            resetAll();
            setActiveSceneId(null);
            toast.success("Reset all surfaces to defaults");
          }}
          onResetSurface={() => {
            resetSurface(doc.surface);
            setActiveSceneId(null);
            toast.success(`Reset ${surfaceName} to defaults`);
          }}
          busy={busy}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          {activeScene ? (
            <InspectorPanel
              scene={activeScene}
              locale={doc.locale}
              selectedKey={selectedKey}
              onChange={(patch) => patchScene(activeScene.id, patch)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Nothing to inspect</p>
              <p className="text-xs">Frame settings appear here once you add or pick one.</p>
            </div>
          )}
        </div>
        <ExportFooter
          onExport={exportBundle}
          exporting={exporting}
          localeCount={doc.locales.length}
          sizeCount={sizeCount}
          busy={busy}
        />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pl-80 md:pl-[22rem]">
        <CanvasHeader
          surface={doc.surface}
          composition={activeScene ? COMPOSITION_NAME[activeScene.composition] : undefined}
          orientation={doc.orientation}
          setOrientation={(v) => commit((d) => ({ ...d, orientation: v }))}
          hasLandscape={allowsLandscape(doc.surface)}
          locale={doc.locale}
          locales={doc.locales}
          setLocale={(v) => commit((d) => ({ ...d, locale: v }))}
          onUndo={undo}
          onRedo={redo}
          savedAt={savedAt}
          saveError={saveError}
          busy={busy}
        />

        <main className="flex min-h-0 flex-1 items-stretch overflow-hidden">
          {activeScene ? (
            <StageViewport
              scene={activeScene}
              surface={doc.surface}
              orientation={doc.orientation}
              palette={palette}
              locale={doc.locale}
              productName={doc.productName}
              productIcon={doc.productIcon}
              selectedKey={selectedKey}
              onLabelChange={(v) => writeLocalizedField(activeScene, "label", v)}
              onHeadlineChange={(v) => writeLocalizedField(activeScene, "headline", v)}
              onBoxChange={(key, box: BoxTransform) =>
                patchScene(activeScene.id, {
                  boxes: { ...(activeScene.boxes || {}), [key]: box },
                })
              }
              onSelect={setSelectedKey}
            />
          ) : (
            <div className="workbench-grid flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No frame selected</p>
              <p>Add a frame from the strip below to get started.</p>
            </div>
          )}
        </main>

        <div className="h-[132px] shrink-0 border-t border-border bg-card">
          <SceneRail
            scenes={scenes}
            activeId={activeScene?.id || null}
            surface={doc.surface}
            orientation={doc.orientation}
            palette={palette}
            locale={doc.locale}
            productName={doc.productName}
            productIcon={doc.productIcon}
            disabled={busy}
            onReorder={reorderScenes}
            onSelect={setActiveSceneId}
            onDelete={deleteScene}
            onDuplicate={duplicateScene}
            onAdd={addScene}
          />
        </div>
      </div>

      {/* Off-screen export targets — full-resolution canvases for html-to-image. */}
      <div aria-hidden style={{ position: "absolute", left: -99999, top: 0, pointerEvents: "none" }}>
        {scenes.map((scene) => (
          <div
            key={scene.id}
            ref={(el) => {
              if (el) exportNodes.current[scene.id] = el;
              else delete exportNodes.current[scene.id];
            }}
            style={{ width: canvasW, height: canvasH, position: "absolute", left: -99999, top: 0 }}
          >
            <SceneRenderer
              scene={scene}
              surface={doc.surface}
              orientation={doc.orientation}
              palette={palette}
              locale={exportLocale ?? doc.locale}
              productName={doc.productName}
              productIcon={doc.productIcon}
              hideEmpty
            />
          </div>
        ))}
      </div>
    </div>
  );
}
