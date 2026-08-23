import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof matchMedia === 'undefined' ? false : matchMedia(query).matches,
  )

  useEffect(() => {
    const list = matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Single breakpoint used across the shell: below 768px we go vertical. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
