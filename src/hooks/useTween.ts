import { useEffect, useRef, useState } from 'react'

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Smoothly tweens a flat object of numbers towards `target`.
 *  Used to reshape the garden preview without a heavy animation system. */
export function useTween<T extends Record<string, number>>(target: T, duration = 800): T {
  const [value, setValue] = useState(target)
  const current = useRef(target)
  const key = JSON.stringify(target)

  useEffect(() => {
    const to = JSON.parse(key) as T
    const from = current.current
    if (duration <= 0) {
      current.current = to
      setValue(to)
      return
    }
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const e = easeInOutCubic(t)
      const next = { ...to }
      for (const k in to) {
        next[k] = (from[k] + (to[k] - from[k]) * e) as T[typeof k]
      }
      current.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [key, duration])

  return value
}
