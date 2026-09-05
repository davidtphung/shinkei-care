export const copy = {
  title: 'Shinkei Care',
  wordmark: 'Shinkei',
  wordmarkLine: 'Care',
  kicker: 'Shinkei Systems',
  subtitle: 'Six Seconds',
  brand: 'Shinkei Systems',
  brandUrl: 'https://shinkei.systems',
  builtBy: 'Built by David T Phung',
  builtByUrl: 'https://x.com/davidtphung',
  play: 'Play',
  playAgain: 'Play again',
  howTo: 'How to play',
  howToClose: 'Close how to play',
  continue: 'Continue',
  bestScore: (n: number) => `Best quality ${n}`,
  careScore: 'Seremoni quality',
  freshnessQuality: 'Freshness quality',
  bestQuality: 'Best quality',
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
  spikeTeach:
    'The mark sits slightly behind and above the eye, toward the center of the head, where the gill-shaped bone meets the lateral line.',
  spikeHit: 'Hit.',
  spikeSuccess: 'Still.',
  spikeMissLate: 'Late.',
  spikeMissEarly: 'Early.',
  spikeMissHigh: 'High.',
  spikeMissWindow: 'Try that window.',
  spikeTarget: 'Brain target',
  spikeHint: 'Hit Brain when it says Now. A short wiggle settles it. Space or Enter also works. Arrows or Tab move to the mark.',
  looksSteady: 'Looks steady',
  bodyLabel: 'Body',
  bodyMiss: 'Fish body. Aim for the Brain mark slightly behind and above the eye.',

  gillName: 'Gill',
  gillLead: 'Cut the gill. Bleed.',
  gillTeach: 'Cut the gill so blood does not sit in the flesh.',
  gillHint:
    'Traditional ikejime may also run a spinal wire (shinkei-jime). Poseidon skips the wire. Spike, gill, ice.',
  gillSuccess: 'Clear.',
  gillMiss: 'Try that line.',
  gillMissHigh: 'High.',
  gillTarget: 'Gill membrane',
  gillAction: 'Cut the gill',
  gillBodyMiss: 'Fish body. Follow the labeled Gill mark on the membrane.',

  coolLead: 'Ice now.',
  coolSuccess: 'Held.',
  coolHint: 'Hold and drag ice onto the cooler, or tap ice then tap the cooler. Arrows pick a token. Enter places it.',
  iceTeach: 'Ice now. Hold the quality you just protected.',
  iceMiss: 'Try that cooler.',
  dragCue: 'Drag',
  dropOpen: 'Open drop zone',

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
    'Hit the brain mark in the six-second window. Aim slightly behind and above the eye, where the gill bone meets the lateral line.',
    'Cut the gill so blood does not sit in the flesh. Poseidon skips the spinal wire.',
    'Ice now. Hold the quality you just protected.',
    'A short wiggle after a hit means it settled. Space, Enter, or tap. Misses drop Freshness.',
  ],

  howToMdaTitle: 'How the arcade thinks',
  howToMda: [
    'Mechanics: tap the Brain mark, cut the gill, ice the hold. Those are the moves.',
    'Dynamics: misses drain Seremoni quality. First-try hits build Combo. The clock never pauses.',
    'Aesthetics: care and stillness. The fish stays intact. The work is boat to plate.',
  ],
  howToLevelsTitle: 'Levels',
  howToLevels: [
    'Craft: spike, gill, ice. Timing and precision.',
    'Systems: cut the stress loop, open the gill valve, keep the cold loop closed.',
    'Chain: keep harvest, bleed, and chill in order, then hand the lot to hold, then seal.',
  ],

  levelsTitle: 'Levels',
  levelName: ['Craft', 'Systems', 'Chain'] as const,
  levelBlurb: [
    'Spike, gill, ice.',
    'Cut the stress loop.',
    'Hold the chain to the plate.',
  ] as const,
  levelLocked: (need: string) => `Clear ${need} to open this level.`,
  playLevel: (name: string) => `Play ${name}`,
  backToLevels: 'Levels',
  backToHub: 'Hub',

  l2SpikeLead: 'Cut the stress loop.',
  l2SpikeTeach: 'Stress feeds a loop. Spike the brain. That is the leverage point.',
  l2SpikeHint: 'Hit Brain when it says Now, before the loop fills. A short wiggle settles it.',
  l2GillLead: 'Open the valve.',
  l2GillTeach: 'Blood is a stock. Cut the gill so it does not sit in the flesh.',
  l2GillHint: 'Traditional ikejime may also run a spinal wire (shinkei-jime). Poseidon skips the wire.',
  l2IceLead: 'Close the cold loop.',
  l2IceTeach: 'Ice now. Cold is a reinforcing loop. Hold the quality you just protected.',

  l3GatesLead: 'Keep the gates in order.',
  l3GatesTeach: 'Harvest, bleed, chill. The order is the system.',
  l3GatesHint: 'Tap the gate that says Now. A wrong gate breaks the chain.',
  l3HandoffLead: 'Hand the lot forward.',
  l3HandoffTeach: 'Boat to cooler to hold. Do not break the cold chain.',
  l3HandoffHint: 'Hold and drag a lot onto Hold, or tap a lot then tap Hold. Arrows pick a lot. Enter places it.',
  l3PlateLead: 'Plate check.',
  l3PlateTeach: 'Only a clean chain earns a high Seremoni quality seal.',
  l3PlateHint: 'Tap the seal. Soft quality still seals what you held.',
  l3PlateAction: 'Seal Seremoni quality',
  l3PlateSoft: 'Soft. Seal what you held.',
  l3PlateHeld: 'Seremoni quality holds.',
  l3GateNames: {
    harvest: 'Harvest',
    bleed: 'Bleed',
    chill: 'Chill',
  },
  l3Lot: 'Lot',
  l3Hold: 'Hold',
  l3GateMiss: 'Try that gate.',
  l3HandoffMiss: 'Try that hold.',

  firstQuality: 'A new Seremoni quality starts at zero.',
  firstTime: 'A new best time starts when you tap Play.',
  firstSavedQuality: 'This is your first saved Seremoni quality.',

  soundOn: 'Sound on. Mute arcade cues.',
  soundOff: 'Sound off. Unmute arcade cues.',
  soundLabel: 'Sound',
  muteLabel: 'Muted',

  time: 'Time',
  bestTime: 'Best time',
  bestTimeValue: (value: string) => `Best time ${value}`,
  newBest: 'New best',

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

export function levelName(level: number): string {
  return copy.levelName[level - 1] ?? copy.levelName[0]
}

export function freshnessWord(value: number, max: number): string {
  const ratio = max === 0 ? 0 : value / max
  if (ratio >= 0.7) return copy.freshnessHeld
  if (ratio >= 0.4) return copy.freshnessSoft
  return copy.freshnessWarm
}
