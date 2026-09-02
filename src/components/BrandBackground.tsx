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
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#FFEBD0_0%,#FFB060_16%,#FF4400_46%,#FF6A1A_68%,#FFC58A_86%,#FFEBD0_100%)]" />
      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(-38deg,transparent,transparent_42px,rgba(11,20,36,0.08)_42px,rgba(11,20,36,0.08)_46px)]" />
    </div>
  )
}
