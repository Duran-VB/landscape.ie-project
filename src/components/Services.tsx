import { useRef, useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { services } from '../data/content'
import { useCanHover } from '../hooks/useMediaQuery'
import { ArrowUpRight, Plus } from './ui/Icons'
import { EASE_OUT, MaskLines, Reveal } from './ui/Motion'
import './Services.css'

/** Editorial service list. Desktop: hovering a row expands it and a related
 *  image follows the cursor. Touch: tapping a row opens it with its image. */
export function Services() {
  const canHover = useCanHover()
  const [active, setActive] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 170, damping: 22, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 170, damping: 22, mass: 0.5 })
  const rotate = useTransform(useVelocity(springX), [-1600, 1600], [-7, 7], { clamp: true })

  const onPointerMove = (e: PointerEvent) => {
    const rect = listRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <section id="services" className="services section bg-charcoal on-dark">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal>
              <p className="label eyebrow services__eyebrow">Services</p>
            </Reveal>
            <MaskLines className="display fs-xl" lines={['What we', <em key="b" className="caps">build</em>]} />
          </div>
          <Reveal delay={0.1}>
            <p className="lead">From the first idea to the final planting — six ways we transform outdoor space.</p>
          </Reveal>
        </div>

        <div
          ref={listRef}
          className="services__wrap"
          onPointerMove={canHover ? onPointerMove : undefined}
          onPointerLeave={canHover ? () => setActive(null) : undefined}
        >
          <ul className="services__list">
          {services.map((service, i) => {
            const isActive = active === i
            return (
              <li
                key={service.number}
                className={`service ${isActive ? 'is-active' : ''}`}
                onPointerEnter={canHover ? () => setActive(i) : undefined}
              >
                {canHover ? (
                  <div className="service__row">
                    <ServiceRowContent number={service.number} title={service.title} description={service.description} canHover />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="service__row"
                    aria-expanded={isActive}
                    onClick={() => setActive(isActive ? null : i)}
                  >
                    <ServiceRowContent number={service.number} title={service.title} description={service.description} />
                  </button>
                )}

                {!canHover && (
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        className="service__panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                      >
                        <p className="service__panel-desc">{service.description}</p>
                        <div className="photo service__panel-photo">
                          <img src={service.photo.src} alt={service.photo.alt} loading="lazy" style={{ objectPosition: service.photo.position }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            )
          })}
          </ul>

          {canHover && (
            <motion.div
              className="services__float"
              style={{ x: springX, y: springY, rotate }}
              animate={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.82 : 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              aria-hidden
            >
              {services.map((service, i) => (
                <img
                  key={service.number}
                  src={service.photo.src}
                  alt=""
                  className={active === i ? 'is-visible' : ''}
                  style={{ objectPosition: service.photo.position }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

function ServiceRowContent({ number, title, description, canHover = false }: { number: string; title: string; description: string; canHover?: boolean }) {
  return (
    <>
      <span className="service__num label">{number}</span>
      <span className="service__title serif">{title}</span>
      <span className="service__desc">{description}</span>
      <span className="service__icon" aria-hidden>
        {canHover ? <ArrowUpRight /> : <Plus />}
      </span>
    </>
  )
}
