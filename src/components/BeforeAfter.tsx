import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { photos } from '../data/images'
import { Drag } from './ui/Icons'
import { MaskLines, Reveal } from './ui/Motion'
import './BeforeAfter.css'

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

export function BeforeAfter() {
  return (
    <section className="ba section bg-paper" aria-label="Before and after">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal>
              <p className="label eyebrow ba__eyebrow">Before / After</p>
            </Reveal>
            <MaskLines
              className="display fs-xl"
              lines={['The difference', 'is in the', <em key="t" className="caps">transformation.</em>]}
            />
          </div>
          <Reveal delay={0.1}>
            <p className="lead">Drag the divider to see how a tired, unused space becomes somewhere you actually want to be.</p>
          </Reveal>
        </div>

        <Reveal y={40}>
          <CompareSlider />
        </Reveal>
      </div>
    </section>
  )
}

function CompareSlider() {
  const frame = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const touched = useRef(false)
  const inView = useInView(frame, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()

  // A single gentle sweep the first time the slider is seen, hinting that it moves.
  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(50, [50, 28, 70, 50], {
      duration: 2.6,
      ease: 'easeInOut',
      delay: 0.4,
      onUpdate: (v) => {
        if (!touched.current) setPos(v)
      },
    })
    return () => controls.stop()
  }, [inView, reduce])

  const setFromClientX = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    setPos(clamp(((clientX - rect.left) / rect.width) * 100))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    touched.current = true
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4
    const keys: Record<string, number> = { ArrowLeft: pos - step, ArrowRight: pos + step, Home: 0, End: 100 }
    if (e.key in keys) {
      e.preventDefault()
      touched.current = true
      setPos(clamp(keys[e.key]))
    }
  }

  return (
    <div
      ref={frame}
      className={`ba__frame ${dragging ? 'is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img className="ba__img" src={photos.after.src} alt={photos.after.alt} loading="lazy" draggable={false} style={{ objectPosition: photos.after.position }} />
      <div className="ba__before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img className="ba__img" src={photos.before.src} alt={photos.before.alt} loading="lazy" draggable={false} style={{ objectPosition: photos.before.position }} />
      </div>

      <span className="ba__label ba__label--before label" style={{ opacity: pos > 14 ? 1 : 0 }}>
        Before
      </span>
      <span className="ba__label ba__label--after label" style={{ opacity: pos < 86 ? 1 : 0 }}>
        After
      </span>

      <div
        className="ba__handle"
        style={{ left: `${pos}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before`}
        onKeyDown={onKeyDown}
      >
        <span className="ba__line" />
        <span className="ba__knob">
          <Drag />
        </span>
      </div>
    </div>
  )
}
