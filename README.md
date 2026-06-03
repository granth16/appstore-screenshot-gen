# Vitrine

A local-first studio for composing **App Store** and **Google Play** listing screenshots. Lay out device mockups, headlines and captures across multiple store surfaces, then export every required resolution as a single zip.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

## How it works

- **Scenes & surfaces** — each store surface (iOS phone, iOS tablet, Play phone, Play tablets, Play banner) keeps its own deck of scenes, so switching tabs never loses work.
- **Compositions** — every scene picks a composition (spotlight, anchored base/crown, stacked pair, type-only, side-by-side, banner) that lays out a copy block and one or two device bezels.
- **Direct manipulation** — drag, resize and rotate the copy and device bezels right on the stage; fine-tune rotation and stacking from the inspector.
- **Localized copy** — labels and headlines are stored per locale and fall back gracefully when a translation is missing.
- **Autosave** — the whole document is mirrored to `localStorage` for instant paint and persisted to `vitrine.project.json` (via `/api/document`) so it survives a clone.
- **Bulk export** — `/studio/export` walks every locale × size for the active surface and renders deterministic PNGs with `html-to-image`, bundled with `jszip`.

## Project layout

```
src/
  app/            Next.js routes + API (document persistence, media upload)
  components/ui/  Headless UI primitives
  domain/         Surfaces, compositions, palettes, geometry settings, types
  text/           Localized-copy helpers
  state/          Seed document + the editing/undo store hook
  runtime/        Deterministic asset (image) cache
  utils/          cn, colour maths, formatting
  studio/         The editor itself
    canvas/       Scene renderer, device bezels, layout maths
    export/       Deck export pipeline
    hooks/        Keyboard shortcuts
```

## Adding captures

1. **Drop a file** in the inspector — it is posted to `/api/media`, hashed and written under `public/captures/uploads/`.
2. **Reference a static file** under `public/captures/{store}/{surface}/{locale}/` and point a scene at it. Paths may contain `{locale}` and are resolved per export.

## Tuning

| File | Controls |
|------|----------|
| `src/domain/surfaces.ts` | Canvas sizes, export sizes, store mapping |
| `src/domain/palettes.ts` | Colour palettes |
| `src/domain/settings.ts` | Bezel geometry, width formulas, storage keys |
| `src/state/seed.ts` | The starter document |
| `src/studio/canvas/composition-rects.ts` | Default element placement per composition |
