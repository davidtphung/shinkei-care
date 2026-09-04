export type HitRect = {
  left: number
  top: number
  right: number
  bottom: number
}

export function expandRect(rect: HitRect, pad: number): HitRect {
  return {
    left: rect.left - pad,
    top: rect.top - pad,
    right: rect.right + pad,
    bottom: rect.bottom + pad,
  }
}

export function pointInRect(x: number, y: number, rect: HitRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

export function rectsOverlap(a: HitRect, b: HitRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

export function hitsDropZone({
  pointerX,
  pointerY,
  drop,
  token,
  pad = 0,
}: {
  pointerX: number
  pointerY: number
  drop: HitRect | null
  token: HitRect | null
  pad?: number
}): boolean {
  if (!drop) return false
  const zone = expandRect(drop, pad)
  if (pointInRect(pointerX, pointerY, zone)) return true
  return Boolean(token && rectsOverlap(token, zone))
}
