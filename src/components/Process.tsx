import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { processSteps } from '../data/content'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { MaskLines, Reveal } from './ui/Motion'
import { Photo } from './ui/Photo'
import './Process.css'

/** Four steps. Desktop: a pinned horizontal journey driven by vertical
 *  scroll. Mobile: a calm vertical story. */
export function Process() {
  const isDesktop = useIsDesktop()
  return isDesktop ? <HorizontalProcess /> : <VerticalProcess />
}

function Intro() {
  return (
    <div className="process__intro">
      <p className="label eyebrow process__eyebrow">How it works</p>
      <MaskLines className="display fs-xl" lines={['Four steps', 'to a garden', <em key="y" className="caps">you love.</em>]} />
      <p className="lead">From the first conversation to the first evening outside.</p>
    </div>
  )
}

function HorizontalProcess() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="process"
      ref={section}
      className="process process--horizontal bg-charcoal on-dark"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="process__sticky">
        <motion.div ref={track} className="process__track" style={{ x }}>
          <Intro />
          {processSteps.map((step, i) => (
            <article key={step.number} className={`process__panel ${i % 2 ? 'is-low' : ''}`}>
              <div className="process__panel-text">
                <span className="process__num serif">{step.number}</span>
                <h3 className="display fs-xxl process__title">{step.title}</h3>
                <p className="process__copy">{step.copy}</p>
              </div>
              <Photo photo={step.photo} className="process__photo" />
            </article>
          ))}
          <div className="process__end" aria-hidden />
        </motion.div>
        <div className="process__progress" aria-hidden>
          <motion.span style={{ scaleX: progress }} />
        </div>
      </div>
    </section>
  )
}

function VerticalProcess() {
  return (
    <section id="process" className="process process--vertical section bg-charcoal on-dark">
      <div className="container">
        <Intro />
        <ol className="process__list">
          {processSteps.map((step) => (
            <li key={step.number}>
              <Reveal className="process__item">
                <Photo photo={step.photo} className="process__photo" parallax={6} />
                <div className="process__item-text">
                  <span className="process__num serif">{step.number}</span>
                  <h3 className="display fs-xl process__title">{step.title}</h3>
                  <p className="process__copy">{step.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
