---
name: storeshots
description: Use when a user wants App Store or Google Play listing screenshots, store marketing images, or a screenshot editor for an iOS/Android app. Scaffolds a ready-to-run Next.js studio (StoreShots) that composes device mockups + marketing copy and exports every required store size as a zip. Triggers on app store screenshots, play store screenshots, listing images, store marketing assets, feature graphic, app screenshot generator, screenshot editor.
---

# StoreShots — App Store & Google Play Screenshot Studio

## Overview

Scaffold a pre-built, local-first Next.js studio that lets the user design and export
**App Store** and **Google Play** listing screenshots. Screenshots are treated as
**advertisements**, not UI dumps — each frame sells one clear outcome with a large headline,
an optional eyebrow, and a device mockup.

The editor already handles all the hard parts:

- A live canvas at the surface's true resolution, scaled to fit.
- CSS-drawn device shells (no image bezels) for iPhone, iPad, and Android phones/tablets.
- Drag / resize / rotate of copy and device on the canvas; layer + rotation controls.
- A storyboard of frames per surface with drag-to-reorder, duplicate, and delete.
- Per-locale copy, so one project can hold multiple language sets.
- Local-first autosave: `localStorage` for instant paint + a `storeshots.project.json` on disk.
- Drop-to-upload captures (`POST /api/media` → `public/captures/uploads/<hash>.png`).
- One-click bulk export to a zip of deterministic PNGs at every required store size.

Supported surfaces out of the box:

- **iPhone** (portrait) — App Store
- **iPad** (portrait) — App Store
- **Android Phone** (portrait) — Google Play
- **Android 7" Tablet** (portrait + landscape) — Google Play
- **Android 10" Tablet** (portrait + landscape) — Google Play
- **Feature Graphic** (1024×500 banner) — Google Play listing header

## Core Principle

**Screenshots are advertisements, not documentation.** Every frame should sell one idea — an
outcome, a feeling, or the removal of a pain point. Use the editor to iterate on copy and
layout fast. Do **not** hand-build `page.tsx`, device frames, or export logic — they already
live in the template.

## What This Skill Does

1. Copies the pre-built app from `template/` (next to this `SKILL.md`) into the user's working directory.
2. Installs dependencies with the user's package manager.
3. Drops the user's screenshots into `public/captures/...` and their app icon into `public/`.
4. (Optionally) prefills `storeshots.project.json` with the user's product name, starting copy,
   and capture paths so the first preview is meaningful.
5. Starts the dev server and tells the user to open the editor in the browser.

You should NOT rewrite the editor, device shells, layout blueprints, or export pipeline by hand.

## Step 0: Probe for an Existing StoreShots Project

Before asking the Step 1 questions, inspect the working directory for an existing install.

```bash
test -f package.json && sed -n '1,80p' package.json
test -f storeshots.project.json && sed -n '1,120p' storeshots.project.json
rg -n "storeshots|StudioDoc|scenesBySurface|runDeckExport|device-shell|/api/document" package.json src 2>/dev/null
find public -maxdepth 4 -path "*/captures*" -print 2>/dev/null
```

If a StoreShots project already exists, do not re-scaffold. Ask whether to (a) update copy /
captures in the existing `storeshots.project.json`, or (b) leave it and just run the dev server.
Edit `storeshots.project.json` with JSON tooling — never regex-edit it.

## Step 1: Gather Context (New Project)

Ask the user, in one message:

1. **What does the app do?** One sentence.
2. **Top 3–5 features**, in priority order (these become individual frames).
3. **Which surfaces?** (iPhone, iPad, Android phone, 7"/10" tablet, feature graphic.)
4. **Locales?** Default `en`. Mention any RTL needs.
5. **Visual direction?** Maps to a palette: `ink` (dark), `frost` (cool light), `clay` (warm), `lagoon` (teal).
6. **How many frames per surface?** Default 3–6.
7. **Asset paths?** Source screenshots and an app icon, if available.

If the user gives little detail, proceed with sensible defaults and note assumptions at the end.

## Step 2: Scaffold

1. Copy everything from `template/` into the target directory (an empty folder, or a new
   subfolder named after the app). Do not copy `node_modules`, `.next`, or any
   `*.project.json` from the template.
2. Install deps with the detected package manager:

   ```bash
   npm install   # or pnpm install / yarn / bun install
   ```

3. Place screenshots under `public/captures/{store}/{surface}/{locale}/` where `store` is
   `apple` or `google`. Place an app icon at `public/app-icon.png` if provided.

## Step 3: Prefill the Project (Optional but Preferred)

Write `storeshots.project.json` at the project root so the first load shows the user's content.
Shape (only `productName` and `scenesBySurface` are essential):

```json
{
  "productName": "Acme",
  "paletteId": "ink",
  "locales": ["en"],
  "locale": "en",
  "surface": "ios-phone",
  "orientation": "portrait",
  "productIcon": "",
  "scenesBySurface": {
    "ios-phone": [
      {
        "id": "sc_intro",
        "composition": "beacon",
        "label": { "en": "WELCOME" },
        "headline": { "en": "Stay consistent,\nevery day." },
        "capture": "/captures/apple/ios-phone/en/01.png"
      }
    ]
  }
}
```

Field rules:

- **surface**: one of `ios-phone`, `ios-tablet`, `play-phone`, `play-tablet-7`,
  `play-tablet-10`, `play-banner`.
- **composition**: one of `beacon`, `plinth`, `canopy`, `duet`, `manifesto`, `column`,
  `marquee`. Vary it across frames for rhythm. `marquee` is only for `play-banner`; `column`
  reads best in landscape; `manifesto` is copy-only.
- **paletteId**: `ink`, `frost`, `clay`, or `lagoon`.
- **label** / **headline**: per-locale maps. `headline` honors `\n` as line breaks.
- **capture**: a path under `/captures/...` (may include `{locale}`), or `""` to leave empty.
- **dark**: optional `true` for a dark frame variant.
- Provide a deck for each surface the user picked. Each scene needs a unique `id`.

Design guidance when authoring copy:

- One outcome per frame; lead with the strongest feature on frame 2 (frame 1 is welcome/brand).
- Keep headlines readable at thumbnail size (a few words, 1–2 lines).
- Vary composition and device placement between adjacent frames.

## Step 4: Run

```bash
npm run dev
```

Tell the user to open `http://localhost:3000`, then:

- Pick a surface from the top picker.
- Drop captures into the inspector, edit eyebrow + headline.
- Reorder frames in the storyboard, fine-tune position/rotation on the canvas.
- Click **Export** to download a zip of every required size for that surface.

## Export Reference

Frames are authored at the largest size per surface and uniformly downscaled. Exports land in
a zip organized by `store/surface/locale/<width>x<height>/`.

- **Apple**: iPhone 1320×2868, 1284×2778, 1206×2622, 1125×2436; iPad 2064×2752, 2048×2732.
- **Google**: Phone 1080×1920; 7" 1200×1920 / 1920×1200; 10" 1600×2560 / 2560×1600; Feature Graphic 1024×500.

## Notes

- Everything runs locally; there is no backend service or account.
- Uploaded captures and `*.project.json` are git-ignored in the template so working files
  don't leak into the user's repo. Commit `storeshots.project.json` only if the user wants the
  deck reproducible after a clone.
- If the user just wants to use the tool without an agent, they can clone the repo, `cd` into
  `skills/storeshots/template`, and run it directly.
