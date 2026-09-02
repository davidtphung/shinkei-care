export const copy = {
  title: 'Shinkei Care',
  subtitle: 'a gentle care routine',
  brand: 'Shinkei Systems',
  brandUrl: 'https://shinkei.systems',
  play: 'Play',
  playAgain: 'Play again',
  howTo: 'How to play',
  howToClose: 'Close how to play',
  continue: 'Continue',
  bestScore: (n: number) => `Best Care Score ${n}`,
  careScore: 'Care Score',
  freshness: 'Freshness',
  of: (a: number, b: number) => `${a} of ${b}`,

  noticeLead: 'Take a calm look.',
  noticeSuccess: 'Nice noticing!',
  noticeNear: 'Almost! Look for the cool-blue clue.',

  coolLead: 'Help the cooler stay chilly.',
  coolSuccess: 'Cool and comfy!',
  coolHint: 'Drag ice, or tap ice then tap the cooler. Arrows pick a token. Enter places it.',

  packLead: 'Pack it gently.',
  packSuccess: 'Packed with care!',
  packHint: 'Drag an item onto its labeled zone, tap to match, or use Choose a spot.',
  chooseSpot: 'Choose a spot',
  chooseSpotFor: (item: string) => `Choose a spot for ${item}`,
  chooseSpotHelp: 'Pick a labeled zone. Each zone matches one item by name.',
  placeIn: (zone: string) => `Place in ${zone}`,

  oceanLead: 'Safe ocean send-off',
  oceanBody: 'The mascot waves and swims on, safe and happy. Care work stays on shore.',
  sealLabel: 'Freshness seal',

  retry: 'Try that one again.',
  keepCool: "Let's keep it nice and cool.",
  learning: "You're learning!",

  labels: {
    great: 'Great Helper',
    careful: 'Careful Keeper',
    ocean: 'Ocean Expert',
  },

  stageOf: (n: number) => `Stage ${n} of 3`,
  skipToGame: 'Skip to game',

  howToBody: [
    'Each round has three cheerful short stages.',
    'Notice what needs a little help. A cool-blue clue, a shape, and a word label all point the way.',
    'Keep the cooler chilly by placing large ice tokens. The drop zone is wide on purpose.',
    'Pack ice, a label, and a reusable container into matching labeled zones.',
    'Keyboard users can finish every stage, including Choose a spot.',
    'After packing, the fish mascot swims away in a separate ocean scene. Nobody is caught, cut, or processed here.',
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
  },
} as const

export function rankLabel(score: number): string {
  if (score >= 260) return copy.labels.ocean
  if (score >= 200) return copy.labels.careful
  return copy.labels.great
}
