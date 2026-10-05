import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatEuro } from '../../data/pricing'
import './AnimatedPrice.css'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/** A price whose digits roll to their new value and briefly warm in colour,
 *  so a change is noticeable without being gimmicky. */
export function AnimatedPrice({ value, className = '' }: { value: number; className?: string }) {
  const reduce = useReducedMotion()
  const formatted = formatEuro(value)
  const chars = formatted.split('')

  // Briefly warm the digits towards forest green whenever the total changes.
  const digits = useRef<HTMLSpanElement>(null)
  const previous = useRef(value)
  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    const el = digits.current
    if (!el || reduce) return
    el.animate([{ color: '#2c5a40' }, { color: getComputedStyle(el).color }], { duration: 1100, easing: 'ease-out' })
  }, [value, reduce])

  return (
    <span className={`price ${className}`}>
      <span className="visually-hidden">{formatted}</span>
      <span ref={digits} className="price__digits" aria-hidden>
        {chars.map((char, i) => {
          // Key from the right so units stay put when the number grows.
          const key = chars.length - i
          if (!/\d/.test(char)) {
            return (
              <span key={`s${key}`} className="price__sym">
                {char}
              </span>
            )
          }
          return (
            <span key={`d${key}`} className="price__digit">
              <motion.span
                className="price__strip"
                initial={false}
                animate={{ y: `${-Number(char) * 10}%` }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20, mass: 1, delay: (chars.length - i) * 0.025 }}
              >
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </motion.span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
