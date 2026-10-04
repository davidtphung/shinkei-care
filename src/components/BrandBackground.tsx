type Props = {
  variant?: 'vitality' | 'ocean'
}

export function BrandBackground({ variant = 'vitality' }: Props) {
  if (variant === 'ocean') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#08101c]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_22%,rgba(255,68,0,0.28),transparent_42%),linear-gradient(180deg,#10203a_0%,#08101c_55%,#050910_100%)]" />
        <div className="absolute left-[18%] top-[16%] h-24 w-24 rounded-full bg-[#ffd7a0] opacity-90" />
        <div className="absolute left-[22%] top-[38%] h-[42%] w-8 bg-gradient-to-b from-[rgba(255,68,0,0.45)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent,rgba(7,12,20,0.55))]" />
        <div className="absolute inset-x-[8%] bottom-[18%] h-10 rounded-[40%] bg-[#d8c4a4] opacity-80" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-cream" />
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#FFEBD0_0%,#FFD2AA_24%,#FF8A45_58%,#FF4400_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-[repeating-linear-gradient(-28deg,transparent,transparent_64px,rgba(11,20,36,0.045)_64px,rgba(11,20,36,0.045)_65px)]" />
      <svg className="absolute top-[14%] left-[6%] h-5 w-5 opacity-[0.12]" viewBox="0 0 7 7" aria-hidden>
        <path
          fill="#0B1424"
          d="M0 0h7v1H0zM0 6h7v1H0zM0 1h1v5H0zM6 1h1v5H6zM2 2h1v1H2zM4 2h1v1H4zM3 3h1v1H3zM2 4h1v1H2zM4 4h1v1H4z"
        />
      </svg>
      <svg className="absolute right-[7%] bottom-[12%] h-6 w-6 opacity-[0.1]" viewBox="0 0 7 7" aria-hidden>
        <path
          fill="#FFEBD0"
          d="M0 0h7v1H0zM0 6h7v1H0zM0 1h1v5H0zM6 1h1v5H6zM2 2h1v1H2zM4 2h1v1H4zM3 3h1v1H3zM2 4h1v1H2zM4 4h1v1H4z"
        />
      </svg>
    </div>
  )
}
