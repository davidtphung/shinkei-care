import { zineCopy } from './copy.ts'

export const SPREAD_COUNT = 7
export const MOBILE_MAX_PX = 700
export const SPREAD_WIDTH = 3240
export const SPREAD_HEIGHT = 2520

export type LeafSide = 'full' | 'left' | 'right'
export type LeafMode = 'spread' | 'single'

export type Stop = {
  stop: number
  spread: number
  chapterId: string
  kicker: string
  title: string
  subtitle: string | null
  caption: string
  alt: string
  pages: readonly string[]
  halves: boolean
}

export const STOPS: readonly Stop[] = [
  {
    stop: 1,
    spread: 1,
    chapterId: 'cover',
    kicker: 'Vol. 01 / No. 01',
    title: 'Seremoni: Sea to Table',
    subtitle: 'Six seconds at sea. Three hours at the table.',
    caption:
      'Seremoni: Sea to Table. Vol. 01, Nov 2026, by David T Phung. A fish calmed in six seconds on a small boat, then given weeks to reach the table.',
    alt: 'Cover: a whole fish on a platter among plates of food, titled Seremoni: Sea to Table, Vol. 01, Nov 2026, by David T Phung',
    pages: ['Cover'],
    halves: false,
  },
  {
    stop: 2,
    spread: 2,
    chapterId: 'trip',
    kicker: '00 The Trip / 01 The Water',
    title: 'This is a story about time.',
    subtitle: 'Nothing has happened yet.',
    caption:
      'Read the trip in the order the fish lived it. Six seconds on deck buy up to three weeks of fresh. In Cook Inlet, seven boats carry a Poseidon, and this fish still holds its cold, calm energy. The name it carries is Seremoni.',
    alt: 'Left: seven stops from the water to the table. Right: a boat in Cook Inlet spray, and the line nothing has happened yet',
    pages: ['P.02', 'P.03'],
    halves: true,
  },
  {
    stop: 3,
    spread: 3,
    chapterId: 'catch',
    kicker: '02 The Catch',
    title: 'The robot rides for free.',
    subtitle: null,
    caption:
      'Bill in Morro Bay, Jay in Ilwaco, and Nick on Martha\'s Vineyard let the robot ride along. A catch that once kept five days now keeps two weeks. They talk about markets, not robots.',
    alt: 'A salmon at the rail beside the Poseidon machine, with Bill in Morro Bay, Jay in Ilwaco, and Nick on Martha\'s Vineyard',
    pages: ['P.04', 'P.05'],
    halves: true,
  },
  {
    stop: 4,
    spread: 4,
    chapterId: 'clock',
    kicker: '03 The Six Seconds',
    title: 'First, learn the word.',
    subtitle: 'Six seconds, on the clock.',
    caption:
      'Ikejime: spike the hindbrain, bleed at the gills, then ice and a cold rest. The clock runs from 0.0 to 6.0 seconds: intake, spike, bleed, ice, record, exit. Shelf life moves from 5 to 7 days toward 2 to 3 weeks.',
    alt: 'Left: a field card for ikejime, spike, bleed, and a cold rest. Right: a clock from 0.0 to 6.0 seconds beside a salmon',
    pages: ['P.06', 'P.07'],
    halves: true,
  },
  {
    stop: 5,
    spread: 5,
    chapterId: 'route',
    kicker: '04 The Record / 05 The Route',
    title: 'The fish brings its own proof.',
    subtitle: 'The map is the menu.',
    caption:
      'At five seconds, Poseidon writes species, vessel, time, and handling, and NERA projects a quality window. Seremoni Grade names the pack. The fish goes on ice to a 16,000 square foot plant in Tacoma, with machines built in El Segundo, and a code for the nearest table.',
    alt: 'Left: a fish record and the Seremoni Grade promises. Right: an operations map from Cook Inlet to Tacoma and El Segundo, with a code for the nearest table',
    pages: ['P.08', 'P.09'],
    halves: true,
  },
  {
    stop: 6,
    spread: 6,
    chapterId: 'table',
    kicker: '06 The Kitchen / 07 The Table',
    title: 'Stress has a flavor.',
    subtitle: 'Six seconds of engineering so dinner can take three hours.',
    caption:
      'A fish that never meets the fight keeps its sweetness and its density for two weeks of patience. Cook it simply: salt, heat, restraint. The mission is Michelin quality fish for all, from Cook Inlet to the restaurant and the home kitchen.',
    alt: 'Left: plated fish and the line stress has a flavor. Right: six seconds of engineering so dinner can take three hours, and Michelin quality fish for all',
    pages: ['P.10', 'P.11'],
    halves: true,
  },
  {
    stop: 7,
    spread: 7,
    chapterId: 'close',
    kicker: 'Close',
    title: 'Six seconds at sea.',
    subtitle: 'Three hours at the table.',
    caption:
      'A Seremoni Grade mark, a Play Sere line, and the sources close the brief. Read it, cook something, and hand it to whoever caught it.',
    alt: 'Back cover: a Seremoni Grade mark, codes for Seremoni, the film, and Play Sere, and the sources',
    pages: ['Back'],
    halves: false,
  },
]

export const CHAPTERS = [
  { id: 'cover', label: 'Cover', stops: [1] },
  { id: 'trip', label: 'Trip', stops: [2] },
  { id: 'catch', label: 'Catch', stops: [3] },
  { id: 'clock', label: 'Clock', stops: [4] },
  { id: 'route', label: 'Route', stops: [5] },
  { id: 'table', label: 'Table', stops: [6] },
  { id: 'close', label: 'Close', stops: [7] },
] as const

export type Leaf = {
  index: number
  stop: number
  spread: number
  side: LeafSide
  file: string
  thumb: string
  title: string
  subtitle: string | null
  caption: string
  alt: string
  kicker: string
  pageLabel: string
  width: number
  height: number
  blur: string
}

export function padSpread(spread: number): string {
  return String(spread).padStart(2, '0')
}

const FILE_PREFIX = 'six-seconds-v4-spread'

export function thumbFile(spread: number): string {
  return `${FILE_PREFIX}-${padSpread(spread)}-thumb.webp`
}

export function midFile(spread: number): string {
  return `${FILE_PREFIX}-${padSpread(spread)}-mid.webp`
}

export function blurFile(spread: number): string {
  return `${FILE_PREFIX}-${padSpread(spread)}-blur.webp`
}

export function clampStop(stop: number): number {
  if (!Number.isFinite(stop)) return 1
  const n = Math.round(stop)
  if (n < 1) return 1
  if (n > SPREAD_COUNT) return SPREAD_COUNT
  return n
}

export function stopByNumber(stop: number): Stop {
  return STOPS[clampStop(stop) - 1]!
}

export function leavesFor(mode: LeafMode): Leaf[] {
  const leaves: Leaf[] = []
  for (const stop of STOPS) {
    const split = mode === 'single' && stop.halves
    if (split) {
      leaves.push(makeLeaf(stop, 'left', stop.pages[0] ?? ''))
      leaves.push(makeLeaf(stop, 'right', stop.pages[1] ?? ''))
    } else {
      leaves.push(makeLeaf(stop, 'full', stop.pages.join('  ')))
    }
  }
  return leaves.map((leaf, index) => ({ ...leaf, index }))
}

function makeLeaf(stop: Stop, side: LeafSide, pageLabel: string): Leaf {
  const pad = padSpread(stop.spread)
  const file = side === 'full' ? `${FILE_PREFIX}-${pad}.webp` : `${FILE_PREFIX}-${pad}-${side}.webp`
  return {
    index: 0,
    stop: stop.stop,
    spread: stop.spread,
    side,
    file,
    thumb: thumbFile(stop.spread),
    title: stop.title,
    subtitle: stop.subtitle,
    caption: stop.caption,
    alt: stop.alt,
    kicker: stop.kicker,
    pageLabel,
    width: side === 'full' ? SPREAD_WIDTH : SPREAD_WIDTH / 2,
    height: SPREAD_HEIGHT,
    blur: blurFile(stop.spread),
  }
}

export function leafIndexFor(leaves: readonly Leaf[], stop: number, side: 0 | 1): number {
  const wanted = clampStop(stop)
  if (side === 1) {
    const right = leaves.find((leaf) => leaf.stop === wanted && leaf.side === 'right')
    if (right) return right.index
  }
  const first = leaves.find((leaf) => leaf.stop === wanted)
  return first ? first.index : 0
}

export function progressScale(index: number, count: number): number {
  if (count <= 0) return 0
  const clamped = Math.min(Math.max(index, 0), count - 1)
  return (clamped + 1) / count
}

export function zineStrings(): string[] {
  const lines: string[] = []
  for (const value of Object.values(zineCopy)) {
    if (typeof value === 'string') lines.push(value)
  }
  for (const stop of STOPS) {
    lines.push(stop.kicker, stop.title, stop.caption, stop.alt, ...stop.pages)
    if (stop.subtitle) lines.push(stop.subtitle)
  }
  for (const chapter of CHAPTERS) lines.push(chapter.label)
  return lines
}
