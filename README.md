# Shinkei Care

A short ikejime arcade. Playable in the browser on phone and desktop.

Wordmark: **Shinkei Care**. Subtitle: **Six Seconds**. Brand: [Shinkei Systems](https://shinkei.systems)

This is a skill game. The mascot is an abstract friendly fish. After the round it rests on ice. There is no gore and no photoreal slaughter.

## Live URL

Play now: **https://davidtphung.github.io/shinkei-care/**

- GitHub source: https://github.com/davidtphung/shinkei-care
- Hosted on David T Phung's user GitHub Pages (`davidtphung.github.io/shinkei-care/`)
- Origin (source of truth): https://origin.cursor.com/git/davidtphung/tmp-7b8db1b6a14c8783.git

GitHub is the public mirror.

## How to play

Each round has three short arcade stages. Same cream cards, pixel tiles, and cooler drop as the live cabinet. Juice is timing, combo, and a six-second pulse.

1. **Spike.** Three cream cards. The Brain card gets a cool-blue ring, a word label, and a six-second pulse. Tap it when it says Now. A miss says Early, Late, High, or Try that window. Freshness drops. Try that beat again.
2. **Gill.** Same card grammar. Tap the Gill card (cool-blue ring plus a word label). Cut the gill so blood does not sit in the flesh. One line notes that traditional ikejime may also run a spinal wire (shinkei-jime). Poseidon skips the wire. Spike, gill, ice.
3. **Ice.** Ice tokens on the left. Dashed cooler drop zone. Drag ice onto the cooler, or tap ice then tap the cooler. Arrow keys choose a token. Enter places it. Ice now. Hold the quality you just protected.

Then a freshness seal, a rest on ice, and an **Ikejime Score**. Rank labels are kind only: Clean Spike, Steady Hands, Six-Second Crew.

First-try hits build Combo. The highest Ikejime Score stays in `localStorage` on this device. No accounts.

## Run locally

```bash
npm install
npm run dev
```

The app listens on `http://127.0.0.1:4721`.

```bash
npm run build
npm run preview
```

## Accessibility

- Hit targets are at least 44px. Drop zones are large.
- Pointer-down press feedback. Springs are critically damped (no bounce, about 0.36s).
- Only `transform` and `opacity` animate.
- `prefers-reduced-motion`: cross-fades, no full-viewport motion, no swim overshoot. The spike window stays open.
- `prefers-reduced-transparency`: solid cream or navy fills.
- Full keyboard path. Space or Enter spikes and cuts. Ice still uses arrows and Enter.
- Visible focus rings. Every control has a name, role, and state.
- Live region announces hits, misses, and the open window.
- Color is never the only clue. Cool-blue is paired with a shape and a word label.
- Mobile first from 375px, plus desktop. Safe-area insets. No horizontal trap.
- Skip to game is the first focusable control.

## Brand tokens

| Token | Value | Use |
| --- | --- | --- |
| Accent | `#FF4400` | Primary actions, vitality bands, mascot body |
| Cream | `#FFEBD0` | Panels, type on navy, corners |
| Navy / ink | `#0B1424` | Type on cream, ocean, matrix borders |
| Cool blue | `#3D8FB5` | Freshness, clues, seal (always with a label) |
| Display | Great Vibes | Script wordmark |
| UI | Outfit | Labels, body, buttons |

Icons are 7x7 ArUco-inspired pixel matrices for cooler, ice, label, basket, freshness seal, brain, gill, and the abstract fish. Poseidon-style linework sits in the background as atmosphere only.

Contrast: navy on cream, cream on navy, and navy on `#FF4400` meet WCAG 2.2 AA. Orange is not used as small body text on cream.

## PWA

`public/manifest.webmanifest` sets the theme color to `#FF4400` and uses standalone display.

## Deploy

Static Vite build. GitHub Pages builds from `.github/workflows/pages.yml` with `BASE_PATH=/shinkei-care/`. Vercel and Origin previews use `/`.
