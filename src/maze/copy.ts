import { copy } from '@/game/copy.ts'

export const mazeCopy = {
  title: 'Maze',
  subtitle: 'Cold run',
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
  pad: 'Move pad',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  legend: 'Heat chases. Delay cuts ahead. Bacteria flees when close. Rough reads the gap.',
  firstQuality: 'A new maze quality starts at zero.',
  levelsTitle: 'Levels',
  levelName: ['Craft', 'Systems', 'Chain'] as const,
  levelBlurb: [
    'Boat deck. Brain spike. Bleed. Ice.',
    'Chill, ice ratio, hold time.',
    'Boat, auction, truck, kitchen, plate.',
  ] as const,
  locked: (need: string) => `Clear ${need} to open this level.`,
  playLevel: (name: string) => `Play ${name}`,
  readyLead: [
    'Boat deck. Spike first.',
    'Close the cold loop.',
    'Boat to plate.',
  ] as const,
  readyTeach: [
    'Mechanics: collect freshness dots. Ice restores the hold. A spike clears spoilage for a short window.',
    'Dynamics: ice ratio and hold time are buffers. A cold-chain boost buys speed while ghosts scatter.',
    'Constraints: boat, auction, truck, kitchen, plate. Take gates in order. Bottlenecks wait.',
  ] as const,
  readyMda: [
    'Aesthetics: a clean run feels like a held lot.',
    'Aesthetics: hurry without rough handling.',
    'Aesthetics: every handoff is a constraint. Keep the lot moving.',
  ] as const,
  howBody: [
    'Move with arrows or WASD. On a phone, use the pad.',
    'Collect cream freshness dots. Clear the maze to seal the lot.',
    'Ice tokens restore freshness and slow spoilage.',
    'A spike token is brief invulnerability. Eat Heat, Delay, Bacteria, and Rough.',
    'A cold-chain token is a speed buffer. Ghosts scatter.',
    'Touch a ghost without a spike and freshness drops. Zero ends the run.',
    'On Chain, take boat, auction, truck, kitchen, then plate. Wrong order is a miss.',
  ],
  howMdaTitle: 'How the maze thinks',
  howMda: [
    'Mechanics: grid move, dots, ice, spike, cold chain, four spoilage ghosts.',
    'Dynamics: Heat chases. Delay aims ahead. Bacteria wanders close then flees. Rough reads the gap between Heat and you. Spike flips the loop.',
    'Aesthetics: care at speed. Seremoni quality is the grade, not raw points alone.',
  ],
  collectDot: 'Fresh.',
  collectIce: 'Ice on. Hold the loop.',
  collectSpike: 'Spike. Spoilage yields.',
  collectChain: 'Cold chain. Move.',
  collectGate: ['Boat.', 'Auction.', 'Truck.', 'Kitchen.', 'Plate.'] as const,
  gateMiss: 'Wrong gate. Boat, auction, truck, kitchen, plate.',
  eatGhost: 'Cleared.',
  hit: 'Spoilage. Freshness dropped.',
  clear: 'Held.',
  over: 'The lot warmed. Try that run again.',
  drain: 'Hold time. Ice the buffer.',
  labels: {
    hold: 'Seremoni Hold',
    chain: 'Cold Chain',
    soft: 'Soft Lot',
  },
  ghostNames: {
    heat: 'Heat',
    delay: 'Delay',
    bacteria: 'Bacteria',
    rough: 'Rough',
  },
} as const

export function mazeLevelName(level: number): string {
  return mazeCopy.levelName[level - 1] ?? mazeCopy.levelName[0]
}

export function mazeRankLabel(score: number, freshness: number, max: number): string {
  const ratio = max === 0 ? 0 : freshness / max
  if (ratio >= 0.7 && score >= 800) return mazeCopy.labels.hold
  if (ratio >= 0.4 || score >= 500) return mazeCopy.labels.chain
  return mazeCopy.labels.soft
}

export function mazeLockedCopy(level: number): string {
  return mazeCopy.locked(copy.levelName[Math.max(0, level - 2)] ?? mazeCopy.levelName[0])
}
