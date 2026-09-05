import type { Dir, Ghost, MazeState } from '@/maze/types.ts'

const NAVY = '#0b1424'
const INK = '#070c14'
const CREAM = '#ffebd0'
const ACCENT = '#ff4400'
const COOL = '#3d8fb5'
const BAND = '#ff8a3d'
const WALL = '#15253c'
const WALL_LINE = '#3d8fb5'

const GHOST_FILL: Record<Ghost['kind'], string> = {
  heat: ACCENT,
  delay: BAND,
  bacteria: COOL,
  rough: '#c4a882',
}

export function drawMaze(ctx: CanvasRenderingContext2D, state: MazeState, width: number, height: number): void {
  const tile = Math.min(width / state.grid.cols, height / state.grid.rows)
  const ox = (width - state.grid.cols * tile) / 2
  const oy = (height - state.grid.rows * tile) / 2
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.translate(ox, oy)

  drawWalls(ctx, state, tile)
  drawPickups(ctx, state, tile)
  for (const ghost of state.ghosts) drawGhost(ctx, state, ghost, tile)
  drawPlayer(ctx, state, tile)
  ctx.restore()
}

function drawWalls(ctx: CanvasRenderingContext2D, state: MazeState, tile: number): void {
  const { cols, rows, cells } = state.grid
  ctx.fillStyle = WALL
  ctx.strokeStyle = WALL_LINE
  ctx.lineWidth = Math.max(1, tile * 0.08)
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (cells[y][x] !== 'wall') continue
      const pad = tile * 0.08
      roundRect(ctx, x * tile + pad, y * tile + pad, tile - pad * 2, tile - pad * 2, tile * 0.18)
      ctx.fill()
      if (open(state, x, y - 1) || open(state, x, y + 1) || open(state, x - 1, y) || open(state, x + 1, y)) {
        ctx.stroke()
      }
    }
  }
}

function open(state: MazeState, x: number, y: number): boolean {
  if (y < 0 || y >= state.grid.rows || x < 0 || x >= state.grid.cols) return false
  return state.grid.cells[y][x] !== 'wall'
}

function drawPickups(ctx: CanvasRenderingContext2D, state: MazeState, tile: number): void {
  for (let y = 0; y < state.grid.rows; y += 1) {
    for (let x = 0; x < state.grid.cols; x += 1) {
      const pickup = state.grid.pickups[y][x]
      if (!pickup) continue
      const cx = (x + 0.5) * tile
      const cy = (y + 0.5) * tile
      if (pickup === 'dot') {
        ctx.fillStyle = CREAM
        ctx.beginPath()
        ctx.arc(cx, cy, tile * 0.1, 0, Math.PI * 2)
        ctx.fill()
      } else if (pickup === 'ice') {
        drawDiamond(ctx, cx, cy, tile * 0.32, COOL)
      } else if (pickup === 'spike') {
        drawSpike(ctx, cx, cy, tile * 0.34, ACCENT)
      } else if (pickup === 'chain') {
        ctx.strokeStyle = COOL
        ctx.lineWidth = Math.max(1.5, tile * 0.1)
        ctx.beginPath()
        ctx.arc(cx, cy, tile * 0.22, 0, Math.PI * 2)
        ctx.stroke()
      } else if (pickup === 'gate') {
        ctx.fillStyle = BAND
        ctx.beginPath()
        ctx.arc(cx, cy, tile * 0.22, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = NAVY
        ctx.font = `600 ${Math.max(8, tile * 0.42)}px Outfit, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const id = state.grid.gates[y][x] ?? ''
        ctx.fillText(id.toUpperCase(), cx, cy + 0.5)
      }
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: MazeState, tile: number): void {
  const { x, y, dir } = state.player
  const cx = (x + 0.5) * tile
  const cy = (y + 0.5) * tile
  const r = tile * 0.42
  const ang = angleFor(dir)
  const hitFlash = state.hitLeft > 0 && !state.reduced && Math.floor(state.elapsed / 80) % 2 === 0
  ctx.fillStyle = hitFlash ? CREAM : ACCENT
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = CREAM
  ctx.lineWidth = Math.max(1.2, tile * 0.08)
  ctx.stroke()
  ctx.fillStyle = NAVY
  ctx.beginPath()
  ctx.arc(cx + Math.cos(ang - 0.9) * r * 0.28, cy + Math.sin(ang - 0.9) * r * 0.28, r * 0.16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hitFlash ? ACCENT : CREAM
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(ang) * r * 0.15, cy + Math.sin(ang) * r * 0.15)
  ctx.lineTo(cx + Math.cos(ang + 0.55) * r * 0.55, cy + Math.sin(ang + 0.55) * r * 0.55)
  ctx.lineTo(cx + Math.cos(ang) * (r + tile * 0.18), cy + Math.sin(ang) * (r + tile * 0.18))
  ctx.lineTo(cx + Math.cos(ang - 0.55) * r * 0.55, cy + Math.sin(ang - 0.55) * r * 0.55)
  ctx.closePath()
  ctx.fill()
}

function drawGhost(ctx: CanvasRenderingContext2D, state: MazeState, ghost: Ghost, tile: number): void {
  const cx = (ghost.x + 0.5) * tile
  const cy = (ghost.y + 0.5) * tile
  const r = tile * 0.36
  const fright = state.frightenLeft > 0 && !ghost.eaten
  const flash = fright && state.frightenLeft < 1.4 && !state.reduced && Math.floor(state.elapsed / 120) % 2 === 0
  ctx.fillStyle = ghost.eaten ? 'transparent' : fright ? (flash ? CREAM : NAVY) : GHOST_FILL[ghost.kind]
  ctx.beginPath()
  ctx.arc(cx, cy - r * 0.12, r, Math.PI, 0)
  ctx.lineTo(cx + r, cy + r * 0.7)
  const waves = 3
  for (let i = waves; i >= 0; i -= 1) {
    const wx = cx - r + (i / waves) * r * 2
    const wy = cy + r * (i % 2 === 0 ? 0.72 : 0.42)
    ctx.lineTo(wx, wy)
  }
  ctx.closePath()
  if (!ghost.eaten) ctx.fill()

  const eye = fright ? CREAM : '#fff'
  const pupil = fright ? CREAM : NAVY
  const look = DIR_VEC_SAFE(ghost.dir)
  drawEye(ctx, cx - r * 0.28, cy - r * 0.12, r * 0.2, eye, pupil, look.x, look.y)
  drawEye(ctx, cx + r * 0.28, cy - r * 0.12, r * 0.2, eye, pupil, look.x, look.y)
}

function DIR_VEC_SAFE(dir: Dir): { x: number; y: number } {
  if (dir === 'left') return { x: -1, y: 0 }
  if (dir === 'right') return { x: 1, y: 0 }
  if (dir === 'up') return { x: 0, y: -1 }
  return { x: 0, y: 1 }
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  eye: string,
  pupil: string,
  lx: number,
  ly: number,
): void {
  ctx.fillStyle = eye
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = pupil
  ctx.beginPath()
  ctx.arc(x + lx * r * 0.35, y + ly * r * 0.35, r * 0.45, 0, Math.PI * 2)
  ctx.fill()
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r * 0.72, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r * 0.72, y)
  ctx.closePath()
  ctx.fill()
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r * 0.22, y - r * 0.22)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x + r * 0.22, y + r * 0.22)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r * 0.22, y + r * 0.22)
  ctx.lineTo(x - r, y)
  ctx.lineTo(x - r * 0.22, y - r * 0.22)
  ctx.closePath()
  ctx.fill()
}

function angleFor(dir: Dir): number {
  if (dir === 'right') return 0
  if (dir === 'down') return Math.PI / 2
  if (dir === 'left') return Math.PI
  return -Math.PI / 2
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
