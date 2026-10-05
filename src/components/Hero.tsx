import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { photos } from '../data/images'
import { site } from '../data/site'
import { ArrowDown, ArrowRight, Star } from './ui/Icons'
import { EASE_EXPO, MaskLines } from './ui/Motion'
import './Hero.css'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // As the page scrolls: the image drifts down and slowly scales (so the next
  // section slides over it), the copy lifts away and fades.
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '32%'])
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0])
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.55])

  return (
    <section id="top" ref={ref} className="hero on-dark" aria-label="Introduction">
      <motion.div className="hero__media" style={{ y: mediaY, scale: mediaScale }}>
        <motion.img
          src={photos.hero.src}
          alt={photos.hero.alt}
          style={{ objectPosition: photos.hero.position }}
          initial={{ scale: 1.14, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ scale: { duration: 2.8, ease: EASE_EXPO }, opacity: { duration: 1.2 } }}
          fetchPriority="high"
        />
      </motion.div>
      <div className="hero__shade" aria-hidden />
      <motion.div className="hero__veil" style={{ opacity: veil }} aria-hidden />

      <motion.div className="hero__content" style={{ y: contentY, opacity: contentOpacity }}>
        <motion.p
          className="label hero__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_EXPO, delay: 0.3 }}
        >
          Landscaping &amp; Garden Design
        </motion.p>

        <MaskLines
          as="h1"
          className="display fs-hero hero__title"
          lines={[
            'Your garden.',
            <em key="r" className="caps">
              Reimagined.
            </em>,
          ]}
          onMount
          delay={0.45}
          stagger={0.12}
        />

        <motion.div
          className="hero__row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.95 }}
        >
          <p className="hero__lead">Bespoke landscaping and garden design, built around the way you live outdoors.</p>
          <div className="hero__ctas">
            <a href="#design" className="btn btn--light">
              Design Your Garden
              <span className="btn__icon">
                <ArrowRight />
              </span>
            </a>
            <a href="#projects" className="btn btn--ghost-light">
              View Our Work
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero__foot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          <a href="#reviews" className="hero__trust">
            <span className="hero__trust-score">
              {site.rating} <Star width={13} height={13} />
            </span>
            <span className="hero__dot" aria-hidden>
              ·
            </span>
            {site.reviewCount} Google Reviews
          </a>
          <span className="hero__scroll label" aria-hidden>
            Scroll <ArrowDown width={14} height={14} />
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
