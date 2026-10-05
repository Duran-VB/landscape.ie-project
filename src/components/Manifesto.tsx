import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { photos, type Photo } from '../data/images'
import { ArrowDown } from './ui/Icons'
import './Manifesto.css'

const frames: { word: string; italic?: boolean; photo: Photo }[] = [
  { word: 'Design.', photo: photos.manifestoDesign },
  { word: 'Build.', photo: photos.manifestoBuild },
  { word: 'Live outside.', italic: true, photo: photos.manifestoLive },
]

/** A pinned, cinematic interlude: one huge image, then DESIGN. BUILD.
 *  LIVE OUTSIDE. — each word taking over as you scroll. */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <section ref={ref} className="manifesto on-dark" aria-label="Design. Build. Live outside.">
      <div className="manifesto__sticky">
        {frames.map((frame, i) => (
          <Frame key={frame.word} index={i} count={frames.length} progress={scrollYProgress} photo={frame.photo} />
        ))}
        <div className="manifesto__shade" aria-hidden />

        <h2 className="manifesto__words">
          {frames.map((frame, i) => (
            <Word key={frame.word} index={i} count={frames.length} progress={scrollYProgress} italic={frame.italic}>
              {frame.word}
            </Word>
          ))}
        </h2>

        <div className="manifesto__foot">
          <div className="manifesto__steps" aria-hidden>
            {frames.map((frame, i) => (
              <Step key={frame.word} index={i} count={frames.length} progress={scrollYProgress} />
            ))}
          </div>
          <a href="#design" className="link">
            Start with the design <ArrowDown />
          </a>
        </div>
      </div>
    </section>
  )
}

type PartProps = { index: number; count: number; progress: MotionValue<number> }

function Frame({ index, count, progress, photo }: PartProps & { photo: Photo }) {
  const start = index / count
  const end = (index + 1) / count
  // Keyframe offsets must stay within 0–1 and increase.
  const fadeFrom = Math.max(0, start - 0.06)
  const opacity = useTransform(progress, [fadeFrom, fadeFrom + 0.1], [index === 0 ? 1 : 0, 1])
  const scale = useTransform(progress, [fadeFrom, end], [1.16, 1.02])
  return (
    <motion.div className="manifesto__frame" style={{ opacity, zIndex: index }}>
      <motion.img src={photo.src} alt="" loading="lazy" style={{ scale, objectPosition: photo.position }} />
    </motion.div>
  )
}

function Word({ index, count, progress, italic, children }: PartProps & { italic?: boolean; children: string }) {
  const start = index / count
  const end = (index + 1) / count
  const last = index === count - 1
  const opacity = useTransform(
    progress,
    last ? [start, start + 0.1] : [start, start + 0.1, end - 0.1, end],
    last ? [0, 1] : [index === 0 ? 1 : 0, 1, 1, 0],
  )
  const y = useTransform(
    progress,
    last ? [start, start + 0.12] : [start, start + 0.12, end - 0.1, end],
    last ? ['40%', '0%'] : [index === 0 ? '0%' : '40%', '0%', '0%', '-40%'],
  )
  return (
    <motion.span className={`manifesto__word display fs-hero ${italic ? 'is-italic' : ''}`} style={{ opacity, y }}>
      {children}
    </motion.span>
  )
}

function Step({ index, count, progress }: PartProps) {
  const start = index / count
  const end = (index + 1) / count
  const scaleX = useTransform(progress, [start, end], [0, 1])
  return (
    <span className="manifesto__step">
      <span className="label">0{index + 1}</span>
      <span className="manifesto__bar">
        <motion.span style={{ scaleX }} />
      </span>
    </span>
  )
}
