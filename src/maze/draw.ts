import { mazeCopy, packLabel } from '@/maze/copy.ts'
import { fishPos } from '@/maze/engine.ts'
import { INTAKE, MACHINE, OCEAN, OUTPUT, PACK_BAY, type CatchState, type PackNeed } from '@/maze/types.ts'

const NAVY = '#0b1424'
const INK = '#070c14'
const CREAM = '#ffebd0'
const ACCENT = '#ff4400'
const COOL = '#3d8fb5'
const BAND = '#ff8a3d'
const SEA = '#102033'
const SEA_LINE = '#1b334d'

export function drawCatch(ctx: CanvasRenderingContext2D, state: CatchState, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, width, height)
  drawOcean(ctx, width, height, state)
  drawMachine(ctx, width, height, state)
  drawPackBay(ctx, width, height, state)
  for (const fish of state.fish) {
    if (!fish.alive) continue
    const pos = fishPos(state, fish)
    drawFish(ctx, pos.x * width, pos.y * height, width * 0.034, fish.kind === 'ice' ? COOL : ACCENT, labelFor(fish.gate), state)
  }
  if (state.special?.live) {
    drawFish(ctx, state.special.x * width, state.special.y * height, width * 0.03, COOL, 'ICE', state)
  }
  for (const payload of state.payloads) {
    drawFish(ctx, payload.x * width, payload.y * height, width * 0.028, payload.kind === 'ice' ? COOL : ACCENT, '', state)
  }
  if (state.scoop.live) drawScoop(ctx, state.scoop.x * width, state.scoop.y * height, width * 0.038)
  drawBoat(ctx, state, width, height)
}

function drawOcean(ctx: CanvasRenderingContext2D, width: number, height: number, state: CatchState): void {
  const x = OCEAN.x0 * width
  const y = OCEAN.y0 * height
  const w = (OCEAN.x1 - OCEAN.x0) * width
  const h = (OCEAN.y1 - OCEAN.y0) * height
  ctx.fillStyle = SEA
  roundRect(ctx, x, y, w, h, 16)
  ctx.fill()
  ctx.strokeStyle = SEA_LINE
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(61, 143, 181, 0.28)'
  ctx.lineWidth = 1.2
  const waves = 5
  for (let i = 0; i < waves; i += 1) {
    const wy = y + h * (0.18 + i * 0.14)
    ctx.beginPath()
    for (let px = 0; px <= 12; px += 1) {
      const xx = x + 8 + (w - 16) * (px / 12)
      const yy = wy + Math.sin(px * 0.9 + state.elapsed / 420 + i) * (state.reduced ? 0 : 3)
      if (px === 0) ctx.moveTo(xx, yy)
      else ctx.lineTo(xx, yy)
    }
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255, 235, 208, 0.35)'
  ctx.font = '600 11px Outfit, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('OCEAN', x + 10, y + 16)
}

function drawMachine(ctx: CanvasRenderingContext2D, width: number, height: number, state: CatchState): void {
  const x = MACHINE.x * width
  const y = MACHINE.y * height
  const w = MACHINE.w * width
  const h = MACHINE.h * height
  const glow = state.machineGlow > 0 || state.jobs.length > 0
  ctx.fillStyle = glow ? '#15253c' : NAVY
  roundRect(ctx, x, y, w, h, 18)
  ctx.fill()
  ctx.strokeStyle = glow ? COOL : CREAM
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = ACCENT
  ctx.fillRect(x + 8, y + 10, w - 16, 8)

  ctx.fillStyle = CREAM
  ctx.font = '700 12px Outfit, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('CARE', x + w / 2, y + 36)

  const mouthX = INTAKE.x * width - 10
  const mouthY = INTAKE.y * height
  const open = glow && !state.reduced ? 10 + Math.sin(state.chew * Math.PI * 2) * 6 : 12
  ctx.fillStyle = INK
  roundRect(ctx, x - 8, mouthY - open, 22, open * 2, 8)
  ctx.fill()
  ctx.strokeStyle = CREAM
  ctx.lineWidth = 2
  ctx.stroke()

  const beat = state.jobs[0]
  if (beat) {
    const t = 1 - beat.left / beat.total
    ctx.fillStyle = t < 0.33 ? ACCENT : t < 0.66 ? COOL : CREAM
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h * 0.48, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = NAVY
    ctx.font = '700 9px Outfit, sans-serif'
    ctx.fillText(t < 0.33 ? 'SPIKE' : t < 0.66 ? 'GILL' : 'ICE', x + w / 2, y + h * 0.49)
  } else {
    ctx.strokeStyle = 'rgba(255, 235, 208, 0.45)'
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h * 0.48, 14, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = BAND
  const chuteX = OUTPUT.x * width
  const chuteY = OUTPUT.y * height
  ctx.beginPath()
  ctx.moveTo(x + w - 4, chuteY - 10)
  ctx.lineTo(chuteX + 8, chuteY - 6)
  ctx.lineTo(chuteX + 8, chuteY + 10)
  ctx.lineTo(x + w - 4, chuteY + 14)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = CREAM
  ctx.font = '600 10px Outfit, sans-serif'
  ctx.fillText('INTAKE', mouthX - 18, mouthY + open + 14)
}

function drawPackBay(ctx: CanvasRenderingContext2D, width: number, height: number, state: CatchState): void {
  const x = PACK_BAY.x0 * width
  const y = PACK_BAY.y0 * height
  const w = (PACK_BAY.x1 - PACK_BAY.x0) * width
  const h = (PACK_BAY.y1 - PACK_BAY.y0) * height
  ctx.fillStyle = '#141c28'
  roundRect(ctx, x, y, w, h, 16)
  ctx.fill()
  ctx.strokeStyle = BAND
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = CREAM
  ctx.font = '600 11px Outfit, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('PACK', x + 10, y + 16)

  if (state.pack.length === 0) {
    ctx.fillStyle = 'rgba(255, 235, 208, 0.45)'
    ctx.font = '500 11px Outfit, sans-serif'
    ctx.fillText('Bay clear', x + 10, y + 40)
    return
  }
  const slotH = Math.min(64, (h - 32) / Math.max(state.pack.length, 1) - 6)
  state.pack.forEach((lot, index) => {
    const sy = y + 26 + index * (slotH + 6)
    ctx.fillStyle = index === 0 ? CREAM : 'rgba(255, 235, 208, 0.72)'
    roundRect(ctx, x + 8, sy, w - 16, slotH, 10)
    ctx.fill()
    ctx.fillStyle = NAVY
    ctx.font = '700 12px Outfit, sans-serif'
    ctx.textAlign = 'left'
    const need = lot.needs[lot.step] ?? lot.needs[0]
    ctx.fillText(packLabel(need), x + 16, sy + slotH / 2 + 4)
    drawNeedDots(ctx, x + w - 28, sy + slotH / 2, lot.needs, lot.step)
  })
}

function drawNeedDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  needs: PackNeed[],
  step: number,
): void {
  needs.forEach((need, index) => {
    ctx.fillStyle = index < step ? COOL : index === step ? ACCENT : NAVY
    ctx.beginPath()
    ctx.arc(x, y - (needs.length - 1) * 5 + index * 10, 3.2, 0, Math.PI * 2)
    ctx.fill()
    void need
  })
}

function drawBoat(ctx: CanvasRenderingContext2D, state: CatchState, width: number, height: number): void {
  const x = state.playerX * width
  const y = 0.86 * height
  const hit = state.hitLeft > 0 && !state.reduced && Math.floor(state.elapsed / 80) % 2 === 0
  ctx.fillStyle = hit ? CREAM : ACCENT
  ctx.beginPath()
  ctx.moveTo(x - 28, y)
  ctx.lineTo(x + 28, y)
  ctx.lineTo(x + 20, y + 14)
  ctx.lineTo(x - 20, y + 14)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = NAVY
  ctx.fillRect(x - 8, y - 12, 16, 12)
  ctx.fillStyle = CREAM
  ctx.fillRect(x - 4, y - 8, 8, 6)
  state.hold.forEach((held, index) => {
    drawFish(
      ctx,
      x - 10 + index * 18,
      y - 18,
      width * 0.018,
      held.kind === 'ice' ? COOL : ACCENT,
      '',
      state,
    )
  })
}

function drawScoop(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.strokeStyle = CREAM
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y, r, Math.PI * 0.15, Math.PI - Math.PI * 0.15)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - r * 0.7, y)
  ctx.lineTo(x - r * 0.2, y + r * 0.85)
  ctx.lineTo(x + r * 0.2, y + r * 0.85)
  ctx.lineTo(x + r * 0.7, y)
  ctx.stroke()
}

function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  label: string,
  state: CatchState,
): void {
  const flip = state.formDir < 0 ? -1 : 1
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(flip, 1)
  ctx.fillStyle = NAVY
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.15, r * 0.72, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 0.58, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = CREAM
  ctx.beginPath()
  ctx.ellipse(-r * 0.18, -r * 0.06, r * 0.32, r * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = NAVY
  ctx.beginPath()
  ctx.arc(-r * 0.28, -r * 0.06, r * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(r * 0.85, 0)
  ctx.lineTo(r * 1.45, -r * 0.42)
  ctx.lineTo(r * 1.45, r * 0.42)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  if (label) {
    ctx.fillStyle = CREAM
    ctx.font = `700 ${Math.max(8, r * 0.55)}px Outfit, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y - r - 4)
  }
}

function labelFor(gate: CatchState['fish'][number]['gate']): string {
  if (!gate) return ''
  return mazeCopy.gateNames[gate].slice(0, 1)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}
