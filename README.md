# StoreShots — Play Store and App Store Screenshots Generator

A skill for AI coding agents (and a ready-to-run app) that scaffolds a local-first Next.js studio
for **App Store** and **Google Play** listing screenshots. It gives you a live canvas, CSS-drawn
device frames, an inspector, per-locale copy, persistent project state, and one-click export
bundles at every store-required size.

[![License: MIT](https://img.shields.io/badge/License-MIT-97D94A.svg)](./LICENSE)

> Demo video coming soon.

## What It Does

- Builds a full screenshot **editor**, not a static one-off page.
- Turns raw app captures into ad-style frames with big, readable copy.
- Composes each frame from a copy block + one or two device shells using named layouts.
- Keeps a separate deck of frames per store surface, so switching surfaces never loses work.
- Stores copy per locale for multi-language screenshot sets.
- Saves every deck to `storeshots.project.json` (git-trackable) and mirrors to `localStorage`.
- Uploads picked screenshots into `public/captures/uploads/<hash>.png`.
- Supports iPhone, iPad, Android phone, Android 7"/10" tablets, and the Play feature graphic.
- Exports exact PNG bundles for all required App Store and Google Play sizes.

## Install (as a skill)

Using the [`skills`](https://skills.sh) CLI:

```bash
npx skills add granth16/appstore-screenshot-gen
```

Install globally:

```bash
npx skills add granth16/appstore-screenshot-gen -g
```

Install for a specific agent:

```bash
npx skills add granth16/appstore-screenshot-gen -a cursor
```

Works with Cursor, Claude Code, Windsurf, Codex, OpenCode, and other agents supported by the
`skills` CLI.

### Manual install

```bash
git clone https://github.com/granth16/appstore-screenshot-gen
```

The skill lives in [`skills/storeshots`](./skills/storeshots).

## Usage

Once installed, ask your coding agent for store screenshots:

```
Build App Store and Google Play screenshots for my app.
```

The skill asks for your app context, source screenshots, surfaces, locales, visual direction,
and frame count, then scaffolds the editor project and starts it.

### Example Prompts

```
Build App Store screenshots for my habit tracker.
It helps people stay consistent with simple daily routines.
6 frames, clean minimal style, warm neutrals.
```

```
Generate App Store + Play screenshots for my finance app.
Strengths: fast expense capture, clear monthly trends, shared budgets.
Sharp, high-contrast style, 7 frames.
```

```
Build screenshots for my language app in English and German.
Lead with the core outcome, vary device placement across frames.
```

### Better Prompt Tips

- Say what the app does in one sentence.
- List the top 3–5 features in priority order.
- Mention the surfaces and locales you need.
- Describe the visual style (maps to a palette: ink, frost, clay, lagoon).
- Say how many frames you want.
- Provide source screenshot paths and an app icon if you have them.

## Prefer to just run the app?

You don't need an agent. The editor is a normal Next.js app:

```bash
git clone https://github.com/granth16/appstore-screenshot-gen
cd appstore-screenshot-gen/skills/storeshots/template
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See
[`skills/storeshots/template/README.md`](./skills/storeshots/template/README.md) for the full
product docs (editor UI, compositions, export sizes, project state, tech stack).

## Repository Layout

```txt
skills/
  storeshots/
    SKILL.md        # the agent skill (what gets installed)
    template/       # the StoreShots editor that the skill scaffolds
```

## Export Sizes

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

## Contributing

Contributions are welcome — especially around export reliability, new device frames,
composition presets, and screenshot design guidance. Open an issue to discuss larger changes,
then send a PR.

## License

MIT
