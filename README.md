# StoreShots — Play Store and App Store Screenshots Generator

StoreShots is an open-source screenshot studio for shipping better **App Store** and
**Google Play** listing creatives. It hands you (or your coding agent) a ready-made, local-first
Next.js workspace where raw app captures become polished marketing frames — with a live stage,
CSS-rendered device shells, an inspector, per-locale copy, autosaved project state, and
one-tap export bundles at every size the stores require.

[![License: MIT](https://img.shields.io/badge/License-MIT-97D94A.svg)](./LICENSE)

## Demo

![StoreShots demo screenshot](./assets/storeshots-demo.png)

## What It Does

- Spins up a real screenshot **studio** instead of a one-off static page.
- Reframes plain product captures into launch-ready marketing frames with bold headlines.
- Builds each frame from a copy block plus one or two device shells via reusable compositions.
- Holds an independent deck of frames per store surface, so flipping surfaces never drops work.
- Tracks copy per locale, so a single project can carry several language sets.
- Persists each deck to `storeshots.project.json` (git-trackable) with a `localStorage` mirror.
- Saves dropped-in captures to `public/captures/uploads/<hash>.png`.
- Covers iPhone, iPad, Android phone, Android 7"/10" tablets, and the Play feature graphic.
- Renders exact PNG bundles for every required App Store and Google Play size.

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

After installing, just tell your coding agent what you need:

```
Build App Store and Google Play screenshots for my app.
```

It collects your app context, source captures, target surfaces, locales, visual direction,
and how many frames you want — then scaffolds the studio and launches it.

### Example Prompts

```
Make App Store screenshots for my habit tracker.
The app keeps people consistent with small daily routines.
6 frames, calm minimal look, soft neutral tones.
```

```
Spin up App Store + Play screenshots for my budgeting app.
Highlight quick expense entry, monthly trend views, and shared budgets.
Crisp high-contrast direction, 7 frames.
```

```
Create screenshots for my language app, English and German.
Open on the main payoff and shift the device placement frame to frame.
```

### Tips For Sharper Output

- Pin down what the app does in a single sentence.
- Rank the 3–5 features that matter most (each becomes a frame).
- Call out the surfaces and locales you actually need.
- Name the mood you want — it maps to a palette: ink, frost, clay, or lagoon.
- State a target frame count.
- Hand over capture paths and an app icon when you have them.

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
