import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

// Shared, restrained motion primitives. Each one is used sparingly — the
// animation should support the story, not decorate every element.

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Fade + lift when the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  amount = 0.25,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  amount?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Masked line-by-line headline reveal. Lines are given explicitly so the
 *  typographic breaks are designed, not left to the browser. The heading
 *  itself is observed (the clipped inner lines would never count as visible). */
export function MaskLines({
  lines,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.08,
  onMount = false,
}: {
  lines: ReactNode[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  delay?: number
  stagger?: number
  onMount?: boolean
}) {
  const Tag = motion[as]
  const trigger = onMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.3 } }
  return (
    <Tag className={className} {...trigger}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span
            variants={{
              hidden: { y: '108%' },
              show: { y: '0%', transition: { duration: 1.25, ease: EASE_EXPO, delay: delay + i * stagger } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Words brighten one by one as the paragraph scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  )
}
