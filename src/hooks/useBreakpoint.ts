import { useEffect, useState } from 'react'

// Utilidad genérica para matchMedia
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return true
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    if ('addEventListener' in mql) {
      mql.addEventListener('change', handler)
    } else {
      // @ts-ignore legacy Safari
      mql.addListener(handler)
    }
    setMatches(mql.matches)

    return () => {
      if ('removeEventListener' in mql) {
        mql.removeEventListener('change', handler)
      } else {
        // @ts-ignore legacy Safari
        mql.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

// Breakpoints por defecto siguiendo Tailwind
export function useIsSm() { return useMediaQuery('(min-width: 640px)') }
export function useIsMd() { return useMediaQuery('(min-width: 768px)') }
export function useIsLg() { return useMediaQuery('(min-width: 1024px)') }
export function useIsXl() { return useMediaQuery('(min-width: 1280px)') }
export function useIs2xl() { return useMediaQuery('(min-width: 1536px)') }
