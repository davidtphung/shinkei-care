type Props = {
  text: string
}

export function HitCue({ text }: Props) {
  return <p className="text-center text-lg font-semibold text-navy">{text}</p>
}
