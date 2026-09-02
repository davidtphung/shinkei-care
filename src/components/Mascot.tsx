type Props = {
  waving?: boolean
  size?: number
  className?: string
}

export function Mascot({ waving = false, size = 160, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 120"
      role="img"
      aria-label="Abstract friendly fish mascot"
      className={className}
    >
      <g transform="translate(18 18)">
        <polygon points="108,50 142,28 142,72" fill="#0B1424" />
        <polygon points="112,50 138,34 138,66" fill="#FFEBD0" />
        <g
          style={{
            transformOrigin: '108px 28px',
            animation: waving ? 'wave-fin 0.9s ease-in-out infinite' : undefined,
          }}
        >
          <polygon points="78,10 108,28 70,32" fill="#FF4400" />
        </g>
        <ellipse cx="62" cy="52" rx="52" ry="34" fill="#0B1424" />
        <ellipse cx="62" cy="52" rx="46" ry="28" fill="#FF4400" />
        <ellipse cx="54" cy="48" rx="18" ry="14" fill="#FFEBD0" />
        <circle cx="50" cy="48" r="7" fill="#0B1424" />
        <circle cx="47" cy="46" r="2.4" fill="#FFEBD0" />
        <rect x="28" y="62" width="10" height="6" fill="#0B1424" />
        <rect x="42" y="66" width="8" height="4" fill="#0B1424" />
      </g>
    </svg>
  )
}
