import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { photos } from '../data/images'
import { site } from '../data/site'
import { ArrowRight, Phone } from './ui/Icons'
import { MaskLines, Reveal } from './ui/Motion'
import './CTA.css'

export function CTA() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.22, 1])
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '0%'])

  return (
    <section ref={ref} className="cta on-dark" aria-label="Get started">
      <motion.div className="cta__media" style={{ scale, y }}>
        <img src={photos.cta.src} alt={photos.cta.alt} loading="lazy" style={{ objectPosition: photos.cta.position }} />
      </motion.div>
      <div className="cta__shade" aria-hidden />

      <div className="container cta__content">
        <MaskLines
          className="display fs-xl cta__title"
          lines={['Ready to see', 'what your garden', <em key="c" className="caps">could become?</em>]}
        />
        <Reveal className="cta__actions" delay={0.2}>
          <a href="#design" className="btn btn--light">
            Design Your Garden
            <span className="btn__icon">
              <ArrowRight />
            </span>
          </a>
          <a href={site.phoneHref} className="btn btn--ghost-light">
            <Phone width={16} height={16} /> Call {site.phone}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
