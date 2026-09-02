import { useEffect, useState } from 'react'

function useMatch(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function usePrefersReducedMotion() {
  return useMatch('(prefers-reduced-motion: reduce)')
}

export function usePrefersReducedTransparency() {
  return useMatch('(prefers-reduced-transparency: reduce)')
}
