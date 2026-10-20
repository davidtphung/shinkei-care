import { zineCopy } from './copy.ts'

export const SPREAD_COUNT = 8
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
    kicker: 'Cover',
    title: 'Six seconds.',
    subtitle: null,
    caption: 'Six seconds. Vol. 01 / Field Brief, by David T Phung, davidtphung.com.',
    alt: 'Cover: the printed brief open to a salmon at the rail, beside the Six seconds cover, Vol. 01 / Field Brief, by David T Phung, davidtphung.com',
    pages: ['Cover'],
    halves: false,
  },
  {
    stop: 2,
    spread: 2,
    chapterId: 'cover',
    kicker: 'Vol. 01 / Field Brief',
    title: 'Six seconds.',
    subtitle: 'Stories from the boats and the factory floor.',
    caption:
      'A salmon comes over the rail. What happens in the next six seconds decides how it tastes two weeks from now. A field brief by David T Phung.',
    alt: 'A whole fish on a platter at a table, titled Six seconds, Vol. 01 / Field Brief, by David T Phung, davidtphung.com',
    pages: ['No. 01'],
    halves: false,
  },
  {
    stop: 3,
    spread: 3,
    chapterId: 'craft',
    kicker: '01 The Engineers / 02 The Craft',
    title: 'Surgery, at sea, in six seconds.',
    subtitle: 'First, learn the word.',
    caption:
      'The El Segundo crew builds Poseidon in salt spray, on a weekly cadence, and the machine finishes the rest in about 6.0 seconds. First, learn the word ikejime: spike, wire, bleed, then a cold rest.',
    alt: 'Left: surgery at sea in salt spray, built week by week in El Segundo. Right: the ikejime card, spike, wire, bleed, and a cold rest',
    pages: ['P.02', 'P.03'],
    halves: true,
  },
  {
    stop: 4,
    spread: 4,
    chapterId: 'boats',
    kicker: '03 The Fishermen',
    title: 'The robot rides for free.',
    subtitle: null,
    caption:
      'Bill in Morro Bay, Jay in Ilwaco, and Nick on Martha\'s Vineyard let the robot ride along. A catch that once kept five days now keeps two weeks.',
    alt: 'A salmon at the rail beside the Poseidon machine, with Bill in Morro Bay, Jay in Ilwaco, and Nick on Martha\'s Vineyard',
    pages: ['P.04', 'P.05'],
    halves: true,
  },
  {
    stop: 5,
    spread: 5,
    chapterId: 'machine',
    kicker: '04 The Machine / 05 Two Crews',
    title: 'Six seconds, on the clock.',
    subtitle: 'Two crews. One promise.',
    caption:
      'The clock runs from 0.0 to 6.0 seconds: intake, see, locate, spike, bleed, record, exit. 93% reach a plate at quality, against about one third in the industry, with 50 species scanned, a $22M Series A, and shelf life of 2 to 3 weeks instead of 5 to 7 days.',
    alt: 'Clock ticks 0.0 to 6.0 s: intake, see, locate, spike, bleed, record, exit, beside the founders and crews',
    pages: ['P.06', 'P.07'],
    halves: true,
  },
  {
    stop: 6,
    spread: 6,
    chapterId: 'table',
    kicker: '06 Seremoni',
    title: 'Stress has a flavor.',
    subtitle: 'Six seconds of engineering so dinner can take three hours.',
    caption:
      'Seremoni keeps fish 2 to 3 weeks at quality with 1 machine, so dinner can take three hours. The mission is Michelin quality fish for all.',
    alt: 'A person in blue gloves at the rail beside a packed fish, and the line six seconds of engineering so dinner can take three hours',
    pages: ['P.08', 'P.09'],
    halves: true,
  },
  {
    stop: 7,
    spread: 7,
    chapterId: 'map',
    kicker: '07 The Operation',
    title: 'The map is the menu.',
    subtitle: null,
    caption:
      'Active operations include 7 boats in Cook Inlet and a Tacoma plant of 16,000 sq ft. The map is the menu, and the store locator finds the nearest table.',
    alt: 'Four layers of one fish beside an active operations map and a code for the nearest table',
    pages: ['P.10', 'P.11'],
    halves: true,
  },
  {
    stop: 8,
    spread: 8,
    chapterId: 'close',
    kicker: 'Close',
    title: 'Field brief close.',
    subtitle: null,
    caption: 'A Seremoni grade strip, a join the team mark, a Play Sere line, and the sources close the brief.',
    alt: 'Seremoni grade marks for wild caught fish, a join the team mark, a Play Sere line, and the sources',
    pages: ['Back'],
    halves: false,
  },
]

export const CHAPTERS = [
  { id: 'cover', label: 'Cover', stops: [1, 2] },
  { id: 'craft', label: 'Craft', stops: [3] },
  { id: 'boats', label: 'Boats', stops: [4] },
  { id: 'machine', label: 'Machine', stops: [5] },
  { id: 'table', label: 'Table', stops: [6] },
  { id: 'map', label: 'Map', stops: [7] },
  { id: 'close', label: 'Close', stops: [8] },
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

const FILE_PREFIX = 'six-seconds-v3-spread'

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
