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
    'Dynamics: ice or seal as labeled. A full bay speeds the school. Hold time drains freshness.',
    'Constraints: feed gate fish in order. Pack ice, then band, then crate before the next wave piles up.',
  ] as const,
  readyMda: [
    'Aesthetics: a clean catch feels like a held lot.',
    'Aesthetics: hurry without rough handling.',
    'Aesthetics: every handoff is a constraint. Keep the lot moving.',
  ] as const,
  howBody: [
    'Move with arrows or A and D. On a phone, use Left and Right.',
    'Catch (Space or W) throws a net up the school. A clean hit lands the fish in the boat hold.',
    'Feed (F or Down) sends a held fish into the machine intake.',
    'The machine runs a short care beat. Fish come out the other side needing a pack.',
    'Pack the oldest lot. Craft uses Ice. Systems uses Ice or Seal. Chain uses Ice, then Band, then Crate.',
    'A missed fish, a wrong pack, or a warm hold drops freshness. Zero ends the run.',
    'On Chain, feed boat, auction, truck, kitchen, then plate. Wrong order is a miss.',
    'If the pack bay lags, the school speeds up. That is the bottleneck.',
  ],
  howMdaTitle: 'How Catch thinks',
  howMda: [
    'Mechanics: left and right, net, feed, machine care beat, pack tokens.',
    'Dynamics: the school advances like a classic invaders wave. A backed-up bay raises pressure. Hold time and pack wait are buffers that can fail.',
    'Aesthetics: care at speed. Seremoni quality is the grade, not raw points alone.',
  ],
  legendCraft: 'Net the school. Feed the intake. Ice the lot.',
  legendSystems: 'Ice or seal as labeled. Do not let the bay or hold sit warm.',
  legendChain: 'Gate order: boat, auction, truck, kitchen, plate. Ice, band, crate.',
  caught: 'On deck. Feed the intake.',
  holdFull: 'Hold full. Feed the machine.',
  fed: 'In. Care beat.',
  machineFull: 'Machine is working. Pack the bay.',
  processDone: 'Out. Pack the lot.',
  packed: 'Sealed.',
  packStep: 'Next pack.',
  packMiss: 'Wrong pack. Read the lot.',
  packIceNeed: 'Ice now.',
  packSealNeed: 'Seal the lot.',
  packBandNeed: 'Band it.',
  packCrateNeed: 'Crate it.',
  collectIce: 'Ice on. Hold the loop.',
  gateMiss: 'Wrong gate. Boat, auction, truck, kitchen, plate.',
  collectGate: ['Boat.', 'Auction.', 'Truck.', 'Kitchen.', 'Plate.'] as const,
  missSchool: 'The school reached the rail.',
  missFeed: 'Move to feed, or clear the machine.',
  emptyHold: 'Hold is empty. Catch first.',
  hit: 'Rough handling. Freshness dropped.',
  clear: 'Held.',
  over: 'The lot warmed. Try that run again.',
  drain: 'Hold time. Ice the buffer.',
  bayFull: 'Bay full. Pack the lot.',
  pressure: 'Bay lag. The school is faster.',
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
