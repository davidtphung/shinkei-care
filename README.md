# Sere

A two-cabinet ikejime arcade. Playable in the browser on phone and desktop.

Wordmark: **Sere**. Brand: [Shinkei Systems](https://shinkei.systems). Hub cards open **Care**, **Catch**, and the **Leaderboard**.

This is a skill game. The mascot is an abstract friendly fish. After a Care round it rests on ice. There is no gore and no photoreal slaughter.

Hash routes: `#` hub, `#care`, `#catch` (also `#maze`, `#run`, `#ocean`), `#leaderboard`.

## Live URL

Play now: **https://sere.davidtphung.com/**

- GitHub source: https://github.com/davidtphung/shinkei-care
- Live host: user Pages (`davidtphung.github.io`, branch `claw`) with CNAME `sere.davidtphung.com`. Project Pages on this repo is still off (Actions cannot create the site).
- This repo is ready for **Deploy from a branch → main → /docs** if the owner enables Pages here later (remove the user-site CNAME first)
- Fallback path: https://davidtphung.github.io/shinkei-care/
- Origin (source of truth): https://origin.cursor.com/git/davidtphung/tmp-7b8db1b6a14c8783.git

GitHub is the public mirror.

## How to play

The hub is the title. Pick Care or Catch. Esc or Hub returns to the title. Mute stays on this device.

### Care

Each Care round has three short arcade stages. Same cream cards, pixel tiles, and cooler drop as the live cabinet. Juice is timing, combo, and a six-second pulse.

1. **Spike.** One cream card holds a silvery side-view fish with a readable eye and gill plate. The brain mark sits slightly behind and above the eye, toward the center of the head, where the gill-shaped bone meets the lateral line. A cool-blue ring, a Brain / Now label, and a six-second pulse fill that mark. Hit it when it says Now. A clean hit opens the mouth, then a short wiggle settles it, fins flare, and the fish goes still. A miss says Early, Late, High, or Try that window. Freshness drops. The fish stays intact.
2. **Gill.** Same cream-card grammar on the fish. Tap the Gill ring on the membrane (cool-blue ring plus a word label). Cut the gill so blood does not sit in the flesh. One line notes that traditional ikejime may also run a spinal wire (shinkei-jime). Poseidon skips the wire. Spike, gill, ice.
3. **Ice.** Ice tokens on the left. Dashed cooler drop zone. Drag ice onto the cooler, or tap ice then tap the cooler. Arrow keys choose a token. Enter places it. Ice now. Hold the quality you just protected.

Arcade cues are original Web Audio ticks (window, spike, miss, gill, ice, combo, seal). Mute stays on this device. `prefers-reduced-motion` starts quiet and still lets you unmute.

Then a freshness seal, a rest on ice, and a **Seremoni quality** result. That is Shinkei's own quality bar for the fish, not an outside certification. Rank labels stay kind: Clean Spike, Steady Hands, Six-Second Crew.

There are three levels. Craft is open first. A first clear of Craft opens Systems. A first clear of Systems opens Chain. Each level stores its own Best quality and Best time. The race clock starts on Play and stops on the result screen. Misses still count.

First-try hits build Combo. Best quality and Best time stay in `localStorage` on this device. No accounts.

### Catch

A Space Invaders-style ocean window. Arrows or A D move the boat. Space or W throws the net. F or Down feeds the machine. On a phone, use Catch, Feed, and the pack buttons.

1. Net fish from the descending school. A clean catch lands them in the boat hold.
2. Feed held fish into the machine intake. The cabinet runs a short spike, gill, ice beat.
3. Fish come out the other side. Pack the oldest lot before the bay backs up.
4. Craft packs Ice. Systems packs Ice or Seal as labeled. Chain packs Ice, then Band, then Crate.
5. A missed school, a wrong pack, or a warm hold drops freshness. Zero ends the run.
6. If packaging lags, the school speeds up. That is the bottleneck. On Chain, feed gate fish in order: boat, auction, truck, kitchen, plate.

**MDA.** Mechanics: move, net, feed, care beat, pack tokens. Dynamics: invaders cadence plus a two-sided handoff. Aesthetics: care at speed. Seremoni quality is the grade.

### Leaderboard

Top 10 each for Care and Catch. Rank, name (3 to 12 characters), quality, time, level, date. Initials prompt after a personal best. Scores stay in `localStorage` on this device. Copy results exports plain text.

Built by [David T Phung](https://x.com/davidtphung).

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

- Hit targets are at least 44px, and larger on small screens. Drop zones are large.
- Ice and lot tokens use `touch-action: none`, pointer capture plus window tracking, and no transform spring while dragging so one finger stays sticky on phone Safari and Chrome.
- Pointer-down press feedback. Springs are critically damped (no bounce, about 0.36s). Drag tokens skip that spring until you let go.
- Only `transform` and `opacity` animate.
- `prefers-reduced-motion`: cross-fades, no full-viewport motion, no swim or flail overshoot. The spike window stays open. Sound starts quiet and can still be unmuted.
- `prefers-reduced-transparency`: solid cream or navy fills.
- Full keyboard path. Space or Enter spikes and cuts. Ice still uses arrows and Enter. Catch uses arrows or A D, Space to net, F to feed, and 1 to 4 to pack. Esc opens Hub or a pause card.
- Visible focus rings. Every control has a name, role, and state.
- Live region announces hits, misses, and the open window.
- Color is never the only clue. Cool-blue is paired with a shape and a word label.
- Mobile first from 375px, plus desktop. Safe-area insets. No horizontal trap. Care ice and drag stages lock page scroll so a drag does not steal the cabinet. Catch title and score stay scrollable so level buttons stay reachable.
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

The public arcade is live at **https://sere.davidtphung.com/**. DNS CNAME `sere.davidtphung.com` → `davidtphung.github.io` is claimed by the user Pages site because creating project Pages on `shinkei-care` still returns `Resource not accessible by integration` (needs Administration).

This repo still has the project-Pages payload: `docs/CNAME`, root-absolute assets in `docs/index.html` / `docs/404.html`, and a workflow that tries **main → /docs** (or publishes `docs/` via Actions). One owner click at [Settings → Pages](https://github.com/davidtphung/shinkei-care/settings/pages) enables that path. Move the custom domain here only after removing `CNAME` from `davidtphung.github.io`.

`published/` remains a copy of the older project-Pages build. Soft-refresh if an old tab still shows a stale cabinet.

Vercel and Origin previews use `/`.
