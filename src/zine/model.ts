import { zineCopy } from './copy.ts'

export const SPREAD_COUNT = 7
export const MOBILE_MAX_PX = 700

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
}

export const STOPS: readonly Stop[] = [
  {
    stop: 1,
    spread: 1,
    chapterId: 'cover',
    kicker: 'Cover',
    title: 'Six seconds.',
    subtitle: null,
    caption:
      'A salmon comes over the rail. What happens in the next six seconds decides how it tastes two weeks from now.',
    alt: 'Cover: a hand holds a silver salmon over a boat rail, gray sea behind',
    pages: ['Cover'],
  },
  {
    stop: 2,
    spread: 2,
    chapterId: 'craft',
    kicker: '01 The Engineers / 02 The Craft',
    title: 'Surgery, at sea, in six seconds.',
    subtitle: 'First, learn the word (ikejime).',
    caption:
      'The El Segundo crew builds Poseidon in salt spray, on a weekly cadence, and the machine finishes the rest in about 6.0 seconds. First, learn the word ikejime: spike, bleed, then a cold rest.',
    alt: 'Left: problem text, salt spray and weekly build cadence. Right: the ikejime card, spike, bleed, rest',
    pages: ['P.02', 'P.03'],
  },
  {
    stop: 3,
    spread: 3,
    chapterId: 'boats',
    kicker: '03 The Fishermen',
    title: 'The robot rides for free.',
    subtitle: null,
    caption:
      'Bill in Morro Bay, Jay in Ilwaco, and Nick on Martha\'s Vineyard let the robot ride along. A catch that once kept five days now keeps two weeks.',
    alt: 'Photo of fish entering the machine, three boats: Bill (Morro Bay), Jay (Ilwaco), Nick (Martha\'s Vineyard)',
    pages: ['P.04', 'P.05'],
  },
  {
    stop: 4,
    spread: 4,
    chapterId: 'machine',
    kicker: '04 The Machine / 05 Two Crews',
    title: 'Six seconds, on the clock.',
    subtitle: 'Two crews, one promise.',
    caption:
      'The clock runs from 0.0 to 6.0 seconds: intake, see, locate, spike, bleed, record, exit. 93% reach a plate at quality, against about one third in the industry, with 50 species scanned, a $22M Series A, and shelf life of 2 to 3 weeks instead of 5 to 7 days.',
    alt: 'Clock ticks 0.0 to 6.0 s: intake, see, locate, spike, bleed, record, exit; founders and crews',
    pages: ['P.06', 'P.07'],
  },
  {
    stop: 5,
    spread: 5,
    chapterId: 'table',
    kicker: '06 Seremoni',
    title: 'Stress has a flavor.',
    subtitle: 'Six seconds of engineering so dinner can take three hours.',
    caption:
      'Seremoni keeps fish 2 to 3 weeks at quality with 1 machine, so dinner can take three hours. The mission is Michelin quality fish for all.',
    alt: 'Table voice, keeps 2 to 3 wks, 1 machine',
    pages: ['P.08', 'P.09'],
  },
  {
    stop: 6,
    spread: 6,
    chapterId: 'table',
    kicker: '07 The Operation',
    title: 'The map is the menu.',
    subtitle: null,
    caption:
      'Active operations include 7 boats in Cook Inlet and a Tacoma plant of 16,000 sq ft. The map is the menu, and the store locator finds the nearest table.',
    alt: 'Active operations map, store locator',
    pages: ['P.10', 'P.11'],
  },
  {
    stop: 7,
    spread: 7,
    chapterId: 'close',
    kicker: 'Close',
    title: 'Field brief close.',
    subtitle: null,
    caption: 'A four-point grade strip, a join-the-team mark, and the sources close the brief.',
    alt: 'Four-point grade strip, join the team, sources',
    pages: ['Back'],
  },
]

export const CHAPTERS = [
  { id: 'cover', label: 'Cover', stops: [1] },
  { id: 'craft', label: 'Craft', stops: [2] },
  { id: 'boats', label: 'Boats', stops: [3] },
  { id: 'machine', label: 'Machine', stops: [4] },
  { id: 'table', label: 'Table', stops: [5, 6] },
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
}

export function padSpread(spread: number): string {
  return String(spread).padStart(2, '0')
}

export function thumbFile(spread: number): string {
  return `six-seconds-spread-${padSpread(spread)}-thumb.webp`
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
    const split = mode === 'single' && stop.spread >= 2 && stop.spread <= 6
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
  const file =
    side === 'full' ? `six-seconds-spread-${pad}.webp` : `six-seconds-spread-${pad}-${side}.webp`
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
    width: side === 'full' ? 1688 : 844,
    height: 1313,
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
