import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { Photo as PhotoData } from '../../data/images'
import { EASE_EXPO } from './easing'

type Props = {
  photo: PhotoData
  className?: string
  /** Vertical drift as the image scrolls through the viewport (0 = none). */
  parallax?: number
  /** Reveal the image with a clip wipe the first time it enters view. */
  reveal?: boolean
  eager?: boolean
}

/** Image-led building block: cover-cropped photo with optional parallax and
 *  a one-time clip reveal. The frame is what gets observed — a fully clipped
 *  element never counts as visible, so the clip lives on an inner layer. */
export function Photo({ photo, className = '', parallax = 0, reveal = false, eager = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-parallax}%`, `${parallax}%`])

  const img = (
    <motion.img
      src={photo.src}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{
        objectPosition: photo.position,
        ...(parallax ? { y, scale: 1 + (parallax * 2.4) / 100 } : null),
      }}
    />
  )

  if (!reveal) {
    return (
      <div ref={ref} className={`photo ${className}`}>
        {img}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={`photo photo--reveal ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.div
        className="photo__clip"
        variants={{
          hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
          show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.5, ease: EASE_EXPO } },
        }}
      >
        {img}
      </motion.div>
    </motion.div>
  )
}
