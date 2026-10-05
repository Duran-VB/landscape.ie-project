import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { SIZE_DIMENSIONS, formatDelta, labelFor, type Selections } from '../../data/pricing'
import { useTween } from '../../hooks/useTween'
import { Moon, Sun } from '../ui/Icons'
import { GardenScene, layoutFor } from './scene/GardenScene'

export type Change = { id: number; text: string; delta?: number }

type Props = {
  selections: Selections
  evening: boolean
  onEveningChange: (evening: boolean) => void
  change?: Change | null
  className?: string
}

/** The live garden visual: a layered isometric model that rebuilds itself as
 *  options change, with a day / evening view and a subtle tactile tilt. */
export function GardenPreview({ selections, evening, onEveningChange, change, className = '' }: Props) {
  const reduce = useReducedMotion()
  const target = useMemo(() => layoutFor(selections), [selections])
  const layout = useTween(target, reduce ? 0 : 850)
  const { e } = useTween({ e: evening ? 1 : 0 }, reduce ? 0 : 900)

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltX, { stiffness: 70, damping: 16 })
  const rotateY = useSpring(tiltY, { stiffness: 70, damping: 16 })

  const onPointerMove = (ev: PointerEvent<HTMLDivElement>) => {
    if (reduce || ev.pointerType !== 'mouse') return
    const rect = ev.currentTarget.getBoundingClientRect()
    tiltY.set(((ev.clientX - rect.left) / rect.width - 0.5) * 7)
    tiltX.set(-((ev.clientY - rect.top) / rect.height - 0.5) * 5)
  }
  const onPointerLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  // Toast that names the change that just happened.
  const [toast, setToast] = useState<Change | null>(null)
  useEffect(() => {
    if (!change) return
    setToast(change)
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [change])

  const dims = selections.dimensions ?? SIZE_DIMENSIONS[selections.size]
  const area = Math.round(dims.length * dims.width)

  return (
    <div className={`preview ${evening ? 'is-evening' : ''} ${className}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="preview__sky" aria-hidden />
      <motion.div className="preview__stage" style={{ rotateX, rotateY }}>
        <GardenScene s={selections} layout={layout} evening={e} />
      </motion.div>

      <div className="preview__top">
        <div className="preview__title">
          <p className="label">Your garden</p>
          <p className="preview__meta">
            {labelFor('size', selections.size)} · ≈ {area} m²
          </p>
        </div>
        <div className="preview__toggle" role="group" aria-label="Preview lighting">
          <button type="button" aria-pressed={!evening} onClick={() => onEveningChange(false)}>
            <Sun /> <span>Day</span>
          </button>
          <button type="button" aria-pressed={evening} onClick={() => onEveningChange(true)}>
            <Moon /> <span>Evening</span>
          </button>
        </div>
      </div>

      <div className="preview__toast-wrap" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              className="preview__toast"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {toast.text}
              {!!toast.delta && (
                <span className={`preview__toast-delta ${toast.delta > 0 ? 'is-up' : 'is-down'}`}>{formatDelta(toast.delta)}</span>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="preview__note">Illustrative concept</p>
    </div>
  )
}
