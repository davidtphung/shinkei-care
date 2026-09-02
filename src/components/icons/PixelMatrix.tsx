import { colors, matrices, type Cell } from './matrices.ts'

type MatrixKey = keyof typeof matrices

type Props = {
  name: MatrixKey
  size?: number
  title?: string
  className?: string
}

export function PixelMatrix({ name, size = 84, title, className }: Props) {
  const grid = matrices[name]
  const cell = 10
  const gap = 1
  const pad = 3
  const dim = pad * 2 + 7 * cell + 6 * gap

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${dim} ${dim}`}
      role="img"
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect width={dim} height={dim} fill="#0B1424" rx="6" />
      {grid.map((row, y) =>
        row.map((value, x) => {
          const fill = cellFill(value)
          if (!fill) return null
          return (
            <rect
              key={`${x}-${y}`}
              x={pad + x * (cell + gap)}
              y={pad + y * (cell + gap)}
              width={cell}
              height={cell}
              fill={fill}
            />
          )
        }),
      )}
    </svg>
  )
}

function cellFill(value: Cell): string | null {
  if (value === 0) return null
  return colors[value]
}
