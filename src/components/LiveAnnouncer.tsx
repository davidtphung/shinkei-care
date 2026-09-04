type Props = {
  message: string
}

export function LiveAnnouncer({ message }: Props) {
  return (
    <div className="stage-announce min-h-12" aria-live="polite" aria-atomic="true">
      {message ? (
        <p className="panel rounded-2xl bg-cream px-4 py-3 text-center text-base font-semibold text-navy">
          {message}
        </p>
      ) : null}
    </div>
  )
}
