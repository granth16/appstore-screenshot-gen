# Vitrine

Local-first studio for creating polished **App Store** and **Google Play** screenshots.

[![License: MIT](https://img.shields.io/badge/License-MIT-97D94A.svg)](./LICENSE)

Vitrine helps you compose store listing screenshots with device mockups, marketing copy,
multiple surfaces, localized text, and one-click PNG export.

## Demo

Demo video coming soon. For now, run it locally and try the editor in your browser.

## Features

- **Store-ready surfaces** for iPhone, iPad, Google Play phones, tablets, and feature banners.
- **Flexible compositions** for hero frames, device-led layouts, paired screenshots, text-only slides, and banners.
- **Direct canvas editing** with drag, resize, rotate, and layer controls.
- **Local-first autosave** through `localStorage` and a local `vitrine.project.json` document.
- **Localized copy** with per-locale labels and headlines.
- **Bulk export** to a zip of deterministic PNGs for the selected surface and output sizes.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # start the Next.js dev server
npm run build    # create a production build
npm run start    # run the production server
```

## Project Layout

```txt
src/
  app/            Next.js routes and API handlers
  components/ui/  UI primitives
  domain/         Surfaces, compositions, palettes, settings, and types
  runtime/        Asset cache
  state/          Seed document and editor state
  studio/         Editor UI, canvas renderer, export flow, and hotkeys
  text/           Localized copy helpers
  utils/          Shared utilities
```

## Adding Captures

Drop an image into the inspector. Uploaded captures are written under
`public/captures/uploads/` and ignored by git so local working files do not leak
into the repository.

## License

MIT
