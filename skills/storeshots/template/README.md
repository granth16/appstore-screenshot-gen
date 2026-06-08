# StoreShots

Local-first studio for creating polished **App Store** and **Google Play** screenshots.

[![License: MIT](https://img.shields.io/badge/License-MIT-97D94A.svg)](./LICENSE)

StoreShots helps you compose store listing screenshots with device mockups, marketing copy,
multiple surfaces, localized text, and one-click PNG export — all running locally in your
browser with no account and no cloud.

## Demo

Demo video coming soon. For now, clone the repo, run it locally, and try the editor in your browser.

## What It Does

- Reframes plain product captures into polished, launch-ready store frames with bold, readable copy.
- Composes each frame on a live canvas with device mockups, headlines, eyebrows, and artwork.
- Keeps a separate deck of frames for every store surface, so switching surfaces never loses work.
- Stores copy per locale, so you can build multiple language sets from one project.
- Exports every required store size for a surface as a single, organized zip of PNGs.
- Saves everything locally — to `localStorage` for instant reloads and to a project file on disk
  so the work survives a refresh.

## Current Editor UI

- **Canvas stage** — the active frame rendered full size, with drag, resize, and rotate directly
  on the device and copy.
- **Floating sidebar** — project identity, the surface picker, and the inspector for the selected
  frame.
- **Surface picker** — one unified menu for iPhone, iPad, Android phone, Android 7"/10" tablets,
  and the Play feature graphic, each tagged with its store.
- **Inspector** — edit layout (composition), eyebrow, headline, artwork, rotation, and layer order
  in a compact two-column property panel.
- **Storyboard rail** — add, select, duplicate, delete, and drag-to-reorder frames with live
  thumbnails.
- **Export** — render the whole surface (every locale × size) to a downloadable zip.
- **Autosave** — writes through `/api/document` to a local project file and mirrors to
  `localStorage`.

### Compositions

Each frame picks a composition that arranges the copy block and one or two device shells:

| Composition | Layout |
|-------------|--------|
| Beacon | Copy raised high, device floating low |
| Plinth | Copy on top, device resting on the base |
| Canopy | Device overhead, copy reading beneath |
| Duet | A paired back + front device |
| Manifesto | Copy only, oversized, no device |
| Column | Copy column left, device right (landscape) |
| Marquee | 1024×500 Play feature banner |

## How To Use

1. Capture real app screenshots from a simulator, emulator, or device.
2. Clone and run the editor:

   ```bash
   git clone https://github.com/granth16/screenshot-gen-appstore.git
   cd screenshot-gen-appstore
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).
4. Pick a surface (e.g. iPhone), set the product name, and choose a composition per frame.
5. Drop your captures into the inspector, then edit eyebrow and headline copy.
6. Arrange frames in the storyboard rail and fine-tune position, rotation, and stacking.
7. Click **Export** to download a zip of store-ready PNGs for that surface.

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `⌘/Ctrl + Z` |
| Redo | `⌘/Ctrl + Shift + Z` or `⌘/Ctrl + Y` |
| Next / previous frame | `↓` / `↑` or `J` / `K` |
| Duplicate frame | `⌘/Ctrl + D` |
| Delete frame | `⌘/Ctrl + Backspace` |
| Deselect | `Esc` |

## Export Sizes

Frames are authored at the largest size for each surface and uniformly downscaled on export.

### Apple App Store

| Display | Resolution |
|---------|------------|
| iPhone 6.9" | 1320 × 2868 |
| iPhone 6.5" | 1284 × 2778 |
| iPhone 6.3" | 1206 × 2622 |
| iPhone 6.1" | 1125 × 2436 |
| iPad 13" | 2064 × 2752 |
| iPad Pro 12.9" | 2048 × 2732 |

### Google Play Store

| Device | Resolution |
|--------|------------|
| Phone | 1080 × 1920 |
| 7" tablet portrait | 1200 × 1920 |
| 7" tablet landscape | 1920 × 1200 |
| 10" tablet portrait | 1600 × 2560 |
| 10" tablet landscape | 2560 × 1600 |
| Feature graphic | 1024 × 500 |

Exports are bundled into a zip organized by `store/surface/locale/<width>x<height>/`, with one
PNG per frame.

## Project State

- `storeshots.project.json` is the local source of truth for product name, palette, locales,
  active surface, orientation, and the per-surface decks of frames. It is written via
  `/api/document` and is git-ignored so local working files never leak into the repo.
- Uploaded captures are written to `public/captures/uploads/<hash>.png` and are also git-ignored.
- The editor reads `localStorage` first for an instant paint, then reconciles with the project
  file on disk.
- Reset controls restore either the active surface or the whole document to the seeded defaults.

## Tech Stack

| Dependency | Purpose |
|------------|---------|
| Next.js | Dev server and app shell |
| React | Editor UI |
| TypeScript | Project and frame state safety |
| Tailwind CSS | Styling |
| Radix UI | Dialogs, selects, labels, tabs |
| html-to-image | Exact PNG rendering |
| JSZip | Export bundle downloads |
| dnd-kit | Frame reordering |
| react-rnd | Draggable and resizable canvas elements |
| lucide-react | Icons |
| sonner | Toast notifications |

## Project Layout

```txt
src/
  app/            Next.js routes and API handlers (document persistence, media upload)
  components/ui/  UI primitives
  domain/         Surfaces, compositions, palettes, settings, and types
  runtime/        Asset cache
  state/          Seed document and editor state
  studio/         Editor UI, canvas renderer, export flow, and hotkeys
  text/           Localized copy helpers
  utils/          Shared utilities
```

## Scripts

```bash
npm run dev      # start the Next.js dev server
npm run build    # create a production build
npm run start    # run the production server
npm run lint     # run the linter
```

## Roadmap

- Demo video and editor screenshots in this README.
- More device frames and composition presets.
- Reusable, shareable color/typography themes.
- Optional connected-canvas mode where elements span adjacent frames.
- One-click deploy template.

## Contributing

Contributions are welcome — especially around export reliability, new device frames, composition
presets, and screenshot design guidance. Open an issue to discuss larger changes, then send a PR.

## License

MIT
