# Shinkei Care

A gentle care routine. Playable in the browser on phone and desktop.

This is a care game. The mascot is an abstract friendly fish. Nothing is caught, cut, harvested, or processed on screen. After packing, the mascot swims away in a separate ocean scene.

Brand: [Shinkei Systems](https://shinkei.systems)

## Live URL

Play now: **https://davidtphung.github.io/shinkei-care/**

- GitHub source: https://github.com/davidtphung/shinkei-care
- Hosted on David T Phung's user GitHub Pages (`davidtphung.github.io/shinkei-care/`)

Origin is the source of truth. GitHub is the public mirror.

## How to play

Each round has three cheerful short stages.

1. **Notice.** Take a calm look. Three large illustrated items float on screen. A cool-blue clue, a shape, and a word label show what needs help. Tap or select the right item.
2. **Keep it cool.** Help the cooler stay chilly. Drag a large ice token onto the open cooler, or tap the ice then tap the cooler. Arrow keys choose a token. Enter places it. Each correct action fills Freshness.
3. **Pack with care.** Place ice, a label, a reusable container, and sometimes a ready tag into matching labeled zones. Keyboard and screen reader users can use **Choose a spot**.

Then a lid closes, a blue freshness seal appears, and the mascot waves from a separate safe ocean scene.

**Care Score** uses kind labels only: Great Helper, Careful Keeper, Ocean Expert.

On a miss you will hear: Try that one again. / Let's keep it nice and cool. / You're learning!

The highest Care Score stays in `localStorage` on this device. No accounts.

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
- `prefers-reduced-motion`: cross-fades, no full-viewport motion, no swim overshoot.
- `prefers-reduced-transparency`: solid cream or navy fills.
- Full keyboard path, including Choose a spot.
- Visible focus rings. Every control has a name, role, and state.
- Live region announces success and near-miss copy.
- Color is never the only clue. Cool-blue is paired with a shape and a word label.
- Mobile first from 375px, plus desktop. Safe-area insets. No horizontal trap.

## Brand tokens

| Token | Value | Use |
| --- | --- | --- |
| Accent | `#FF4400` | Primary actions, vitality bands, mascot body |
| Cream | `#FFEBD0` | Panels, type on navy, corners |
| Navy / ink | `#0B1424` | Type on cream, ocean, matrix borders |
| Cool blue | `#3D8FB5` | Freshness, clues, seal (always with a label) |
| Display | Great Vibes | Script wordmark |
| UI | Outfit | Labels, body, buttons |

Icons are 7x7 ArUco-inspired pixel matrices for cooler, ice, label, basket, freshness seal, and the abstract fish. Poseidon-style linework sits in the background as atmosphere only.

Contrast: navy on cream, cream on navy, and navy on `#FF4400` meet WCAG 2.2 AA. Orange is not used as small body text on cream.

## PWA

`public/manifest.webmanifest` sets the theme color to `#FF4400` and uses standalone display.

## Deploy

Static Vite build. GitHub Pages builds from `.github/workflows/pages.yml` with `BASE_PATH=/shinkei-care/`. The live host today is the user Pages site at `/shinkei-care/`.
