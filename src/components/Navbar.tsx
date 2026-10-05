import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { navLinks, site } from '../data/site'
import { setScrollLocked } from '../lib/scroll'
import { ArrowRight, Phone, Stars } from './ui/Icons'
import { EASE_EXPO } from './ui/Motion'
import './Navbar.css'

export function Navbar() {
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        setSolid(y > 40)
        // Tuck the bar away while reading down the page; bring it back on scroll up.
        setHidden(y > 520 && y > lastY.current + 2)
        if (Math.abs(y - lastY.current) > 2) lastY.current = y
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    setScrollLocked(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const classes = ['nav', solid && 'is-solid', hidden && !open && 'is-hidden', open && 'is-open'].filter(Boolean).join(' ')

  return (
    <>
      <header className={classes}>
        <div className="nav__inner">
          <a href="#top" className="nav__brand" aria-label={`${site.name} — back to top`}>
            {site.wordmark}
          </a>

          <nav className="nav__links" aria-label="Primary">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav__link">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a href="#design" className={`btn btn--sm nav__cta ${solid ? 'btn--primary' : 'btn--light'}`}>
              Design Your Garden
            </a>
            <button
              type="button"
              className="nav__menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span>{open ? 'Close' : 'Menu'}</span>
              <span className="nav__burger" aria-hidden>
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu on-dark"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.8, ease: EASE_EXPO }}
          >
            <nav className="menu__links" aria-label="Mobile">
              {[...navLinks.slice(0, 2), { label: 'Design Your Garden', href: '#design' }, ...navLinks.slice(2)].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="menu__link"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.15 + i * 0.05 }}
                >
                  <span className="menu__index">0{i + 1}</span>
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <a className="menu__phone" href={site.phoneHref}>
                <Phone width={18} height={18} /> {site.phone}
              </a>
              <p className="menu__rating">
                <Stars rating={site.rating} /> {site.rating} · {site.reviewCount} Google Reviews
              </p>
              <a href="#design" className="btn btn--light btn--block" onClick={() => setOpen(false)}>
                Design Your Garden
                <span className="btn__icon">
                  <ArrowRight />
                </span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
