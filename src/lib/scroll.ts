import Lenis from 'lenis'

// Smooth scrolling (Lenis) plus two helpers the UI needs: scrolling to an
// anchor and locking the page while a menu or dialog is open.

let lenis: Lenis | null = null

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.09, smoothWheel: true })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  // Resolve against the real scroll position: Lenis' internal position can lag
  // behind after scrolls it didn't drive (focus, scroll anchoring, find-in-page).
  let top = 0
  if (typeof target === 'number') {
    top = target
  } else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    if (!el) return
    top = el.getBoundingClientRect().top + window.scrollY
  }
  top = Math.max(0, top + offset)

  if (lenis) {
    lenis.resize()
    lenis.scrollTo(top, { duration: 1.5 })
    return
  }
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
