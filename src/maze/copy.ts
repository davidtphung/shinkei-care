import { copy } from '@/game/copy.ts'

export const mazeCopy = {
  title: 'Catch',
  subtitle: 'Boat to lot',
  kicker: 'Shinkei Systems',
  play: 'Play',
  playAgain: 'Play again',
  backLevels: 'Levels',
  hub: 'Hub',
  howTo: 'How to play',
  howToClose: 'Close how to play',
  ready: 'Ready',
  start: 'Start run',
  paused: 'Paused',
  resume: 'Resume',
  leave: 'Hub',
  freshness: 'Freshness',
  quality: 'Seremoni quality',
  time: 'Time',
  pad: 'Catch controls',
  left: 'Left',
  right: 'Right',
  catch: 'Catch',
  feed: 'Feed',
  ship: 'Ship',
  packIce: 'Ice',
  packSeal: 'Seal',
  packBand: 'Band',
  packCrate: 'Crate',
  firstQuality: 'A new Catch quality starts at zero.',
  levelsTitle: 'Levels',
  levelName: ['Craft', 'Systems', 'Chain'] as const,
  levelBlurb: [
    'Boat catch. Feed the machine. Ice the lot.',
    'Hold time, ice or seal, do not let the bay back up.',
    'Boat to plate. Ice, band, crate. Keep the chain moving.',
  ] as const,
  locked: (need: string) => `Clear ${need} to open this level.`,
  playLevel: (name: string) => `Play ${name}`,
  readyLead: [
    'Boat deck. Catch, then feed.',
    'Close the cold loop.',
    'Boat to lot.',
  ] as const,
  readyTeach: [
    'Mechanics: net the school, feed the intake, ice each fish that comes out.',
    'Dynamics: ice or seal as labeled. A busy bay speeds the school a little. Hold time lowers freshness.',
    'Constraints: feed gate fish in order. Pack ice, then band, then crate. S ships the done lots.',
  ] as const,
  readyMda: [
    'Aesthetics: a clean catch feels like a held lot.',
    'Aesthetics: hurry with a steady hand.',
    'Aesthetics: every handoff is a constraint. Keep the lot moving.',
  ] as const,
  howBody: [
    'Arrows or A D to move. Space or C nets the school. F or I feeds the intake. P packs the next item. S ships done lots. Ice, seal, band, or crate on the bay with 1 to 4.',
    'W or Up also nets. Down or Enter also feeds. E seals. B bands. On a phone, use Left, Right, Catch, Feed, Ship, and the pack buttons.',
    'A clean catch lands the fish in the boat hold. Feed sends a held fish into the machine.',
    'The machine runs a short care beat. Fish come out the other side needing a pack.',
    'Pack the oldest open lot. Done lots stay in the bay. Craft uses Ice. Systems uses Ice or Seal. Chain uses Ice, then Band, then Crate.',
    'The bay ships on its own when every spot is a done lot, or when the last fish is packed. S or Ship sends the done lots together.',
    'A careful catch, feed, or pack raises freshness. Waiting eases it down, and a warm hold eases it faster. A fish at the rail or a different pack lowers it. At zero, try that run again.',
    'On Chain, feed boat, auction, truck, kitchen, then plate. Keep that order.',
    'A busy bay speeds the school a little, then the pace settles when you pack or ship.',
  ],
  howMdaTitle: 'How Catch thinks',
  howMda: [
    'Mechanics: left and right, net, feed, machine care beat, pack tokens, ship the done bay.',
    'Dynamics: the school advances like a classic invaders wave. A busy bay raises the pace a little, then it settles. Hold time and pack wait are buffers to keep cool.',
    'Aesthetics: care at speed. Seremoni quality is the grade, not raw points alone.',
  ],
  legendCraft: 'Net the school. Feed the intake. Ice the lot. C nets, I feeds, P packs, S ships.',
  legendSystems: 'Ice or seal as labeled. P packs the next item. S ships done lots.',
  legendChain: 'Gate order: boat, auction, truck, kitchen, plate. Ice, band, or crate with 1 to 4, P for the next item, S to ship.',
  caught: 'On deck. Feed the intake.',
  holdFull: 'Hold full. Feed the machine.',
  fed: 'In. Care beat.',
  machineFull: 'Machine is working. Pack the bay.',
  processDone: 'Out. Pack the lot.',
  packed: 'Sealed.',
  packStep: 'Next pack.',
  packAgain: 'Nice careful pack. Read the lot.',
  packIceNeed: 'Ice now.',
  packSealNeed: 'Seal the lot.',
  packBandNeed: 'Band it.',
  packCrateNeed: 'Crate it.',
  collectIce: 'Ice on. Hold the loop.',
  gateAgain: 'Try again. Boat, auction, truck, kitchen, plate.',
  collectGate: ['Boat.', 'Auction.', 'Truck.', 'Kitchen.', 'Plate.'] as const,
  railTouch: 'Gentle catch next.',
  feedFirst: 'Feed the intake, or give the machine a moment.',
  shipWait: 'Pack a lot, then ship.',
  shipReady: 'Done lots are ready. S ships them.',
  bayOneLeft: 'One spot left in the bay.',
  bayHolding: 'The bay is holding. Pack the next lot, or ship.',
  bayDone: 'Done',
  bayClear: 'Bay clear',
  emptyHold: 'Hold is empty. Catch first.',
  hit: 'Gentle catch next.',
  clear: 'Held.',
  over: 'The lot warmed. Try that run again.',
  drain: 'The hold is warm. A cool bay keeps freshness.',
  pressure: 'The bay is busy, so the school eases ahead.',
  shippedCount: (n: number) => `Shipped ${n}`,
  labels: {
    hold: 'Clean Lot',
    chain: 'Steady Bay',
    soft: 'Soft Lot',
  },
  gateNames: {
    boat: 'Boat',
    auction: 'Auction',
    truck: 'Truck',
    kitchen: 'Kitchen',
    plate: 'Plate',
  },
} as const

export function mazeLevelName(level: number): string {
  return mazeCopy.levelName[level - 1] ?? mazeCopy.levelName[0]
}

export function mazeRankLabel(score: number, freshness: number, max: number): string {
  const ratio = max === 0 ? 0 : freshness / max
  if (ratio >= 0.7 && score >= 600) return mazeCopy.labels.hold
  if (ratio >= 0.4 || score >= 350) return mazeCopy.labels.chain
  return mazeCopy.labels.soft
}

export function mazeLockedCopy(level: number): string {
  return mazeCopy.locked(copy.levelName[Math.max(0, level - 2)] ?? mazeCopy.levelName[0])
}

export function mazeLegend(level: number): string {
  if (level === 2) return mazeCopy.legendSystems
  if (level === 3) return mazeCopy.legendChain
  return mazeCopy.legendCraft
}

export function packLabel(need: PackNeed): string {
  if (need === 'seal') return mazeCopy.packSeal
  if (need === 'band') return mazeCopy.packBand
  if (need === 'crate') return mazeCopy.packCrate
  return mazeCopy.packIce
}

export type PackNeed = 'ice' | 'seal' | 'band' | 'crate'
