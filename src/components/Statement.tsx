import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { photos } from '../data/images'
import './Statement.css'

/** Full-bleed visual statement: a framed image opens out to fill the screen
 *  while two lines of type drift in from either side. */
export function Statement() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const inset = useTransform(scrollYProgress, [0, 0.42], [16, 0])
  const sideInset = useTransform(scrollYProgress, [0, 0.42], [22, 0])
  const clipPath = useTransform([inset, sideInset], ([v, h]) => `inset(${v}% ${h}% ${v}% ${h}%)`)
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [1.14, 1.03, 1])
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '4%'])
  const lineOneX = useTransform(scrollYProgress, [0.2, 1], ['14%', '-4%'])
  const lineTwoX = useTransform(scrollYProgress, [0.2, 1], ['-14%', '4%'])
  const textOpacity = useTransform(scrollYProgress, [0.26, 0.46], [0, 1])

  return (
    <section ref={ref} className="statement on-dark" aria-label="From empty space to somewhere you want to be">
      <div className="statement__sticky">
        <motion.div className="statement__frame" style={{ clipPath }}>
          <motion.img src={photos.statement.src} alt={photos.statement.alt} style={{ scale, y, objectPosition: photos.statement.position }} loading="lazy" />
          <div className="statement__shade" aria-hidden />
        </motion.div>

        <motion.h2 className="statement__text display" style={{ opacity: textOpacity }}>
          <motion.span className="statement__line" style={{ x: lineOneX }}>
            From empty space
          </motion.span>
          <motion.span className="statement__line statement__line--two" style={{ x: lineTwoX }}>
            <em>to somewhere you</em> <em>want to be.</em>
          </motion.span>
        </motion.h2>
      </div>
    </section>
  )
}
