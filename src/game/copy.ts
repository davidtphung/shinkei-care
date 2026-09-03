export const copy = {
  title: 'Six Seconds',
  kicker: 'Shinkei Care',
  subtitle: 'spike, gill, ice',
  brand: 'Shinkei Systems',
  brandUrl: 'https://shinkei.systems',
  play: 'Play',
  playAgain: 'Play again',
  howTo: 'How to play',
  howToClose: 'Close how to play',
  continue: 'Continue',
  bestScore: (n: number) => `Best Ikejime Score ${n}`,
  careScore: 'Ikejime Score',
  freshness: 'Freshness',
  combo: 'Combo',
  comboCount: (n: number) => `Combo ${n}`,
  of: (a: number, b: number) => `${a} of ${b}`,
  windowOpen: 'Window open.',
  windowClosed: 'Window closed.',
  cycleLabel: 'Six-second cycle',
  now: 'Now',

  spikeName: 'Spike',
  spikeLead: 'Spike the brain first.',
  spikeTeach: 'Spike the brain so it stays still.',
  spikeSuccess: 'Still.',
  spikeMissLate: 'Late.',
  spikeMissEarly: 'Early.',
  spikeMissHigh: 'High.',
  spikeMissWindow: 'Try that window.',
  spikeTarget: 'Brain target',
  spikeHint: 'Tap the brain when the cycle hits Now. Space or Enter also works.',

  gillName: 'Gill',
  gillLead: 'Cut the gill. Bleed.',
  gillTeach: 'Cut the gill so blood does not sit in the flesh.',
  gillHint:
    'Traditional ikejime may also run a spinal wire (shinkei-jime). Poseidon skips the wire. Spike, gill, ice.',
  gillSuccess: 'Clear.',
  gillMiss: 'Try that line.',
  gillMissHigh: 'High.',
  gillTarget: 'Gill line',
  gillAction: 'Cut the gill',

  coolLead: 'Ice now.',
  coolSuccess: 'Held.',
  coolHint: 'Drag ice onto the cooler, or tap ice then tap the cooler. Arrows pick a token. Enter places it.',
  iceTeach: 'Ice now. Hold the quality you just protected.',
  iceMiss: 'Try that cooler.',

  packLead: 'Pack it gently.',
  packSuccess: 'Packed with care!',
  packHint: 'Drag an item onto its labeled zone, tap to match, or use Choose a spot.',
  chooseSpot: 'Choose a spot',
  chooseSpotFor: (item: string) => `Choose a spot for ${item}`,
  chooseSpotHelp: 'Pick a labeled zone. Each zone matches one item by name.',
  placeIn: (zone: string) => `Place in ${zone}`,

  oceanLead: 'The hold',
  oceanBody: 'Brain first. Gill next. Ice last. That order is the craft.',
  sealLabel: 'Freshness seal',
  restLead: 'Quality holds.',
  restBody: 'The mascot rests on ice. The work stays in the flesh.',

  retry: 'Try that one again.',
  keepCool: "Let's keep it nice and cool.",
  learning: "You're learning!",

  labels: {
    great: 'Clean Spike',
    careful: 'Steady Hands',
    ocean: 'Six-Second Crew',
  },

  stageNames: ['Spike', 'Gill', 'Ice'] as const,
  stageOf: (n: number) => `Stage ${n} of 3`,
  skipToGame: 'Skip to game',

  howToBody: [
    'Spike the brain in the six-second window so the fish does not fight.',
    'Cut the gill to bleed. Poseidon skips the spinal wire.',
    'Ice now to hold the quality you just protected.',
    'Space, Enter, or tap. Misses drop Freshness. Play again anytime.',
  ],

  itemNames: {
    cooler: 'Cooler',
    ice: 'Ice pack',
    label: 'Label',
    basket: 'Basket',
    fish: 'Friendly fish',
    container: 'Reusable container',
    tag: 'Ready tag',
    seal: 'Freshness seal',
    brain: 'Brain',
    gill: 'Gill',
  },

  zoneNames: {
    ice: 'Ice nest',
    label: 'Label pocket',
    container: 'Reusable bin',
    tag: 'Ready slot',
  },

  clue: {
    cooler: 'Low chill',
    ice: 'Warming up',
    label: 'Needs a check',
    basket: 'Needs lining',
    fish: 'Wants a cooler',
    brain: 'Brain',
    gill: 'Gill',
  },

  freshnessHeld: 'Held',
  freshnessSoft: 'Soft',
  freshnessWarm: 'Warming',
} as const

export function rankLabel(score: number): string {
  if (score >= 300) return copy.labels.ocean
  if (score >= 220) return copy.labels.careful
  return copy.labels.great
}

export function freshnessWord(value: number, max: number): string {
  const ratio = max === 0 ? 0 : value / max
  if (ratio >= 0.7) return copy.freshnessHeld
  if (ratio >= 0.4) return copy.freshnessSoft
  return copy.freshnessWarm
}
