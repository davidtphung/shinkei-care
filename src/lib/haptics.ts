export type HapticKind = 'start' | 'success' | 'miss'

export function haptic(kind: HapticKind) {
  try {
    const pattern = kind === 'start' ? 8 : kind === 'success' ? [10, 16, 14] : 18
    navigator.vibrate?.(pattern)
  } catch {
    // Some browsers expose vibrate but reject it. Play still works.
  }
}
