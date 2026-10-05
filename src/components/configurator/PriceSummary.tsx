import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatEuro, type BreakdownLine } from '../../data/pricing'
import { Close } from '../ui/Icons'
import { AnimatedPrice } from '../ui/AnimatedPrice'

export const DISCLAIMER =
  'Indicative estimate only. Final pricing depends on measurements, site conditions, materials and the final design.'

/** Line-by-line breakdown of the estimate. */
export function Breakdown({ lines, total, showTotal = true }: { lines: BreakdownLine[]; total: number; showTotal?: boolean }) {
  return (
    <div className="breakdown">
      <ul className="breakdown__lines">
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.li
              key={line.key}
              layout="position"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="breakdown__row">
                <span className="breakdown__label">
                  {line.label}
                  <span className="breakdown__detail">{line.detail}</span>
                </span>
                <span className="breakdown__amount num">{line.amount ? formatEuro(line.amount) : 'Included'}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {showTotal && (
        <div className="breakdown__total">
          <span>Estimated project price</span>
          <span className="num">{formatEuro(total)}</span>
        </div>
      )}
    </div>
  )
}

/** The always-visible estimate that sits with the garden preview. */
export function PriceSummary({ total, lines }: { total: number; lines: BreakdownLine[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="price-bar">
      <AnimatePresence>
        {open && (
          <motion.div
            id="price-breakdown"
            className="price-bar__panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
          >
            <div className="price-bar__panel-head">
              <p className="label">Price breakdown</p>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close price breakdown">
                <Close />
              </button>
            </div>
            <Breakdown lines={lines} total={total} />
            <p className="price-bar__panel-note">{DISCLAIMER}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="price-bar__main">
        <p className="label price-bar__label">Estimated project price</p>
        <AnimatedPrice value={total} className="price-bar__value" />
      </div>
      <div className="price-bar__side">
        <button type="button" className="price-bar__toggle" aria-expanded={open} aria-controls="price-breakdown" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide breakdown' : 'See price breakdown'}
        </button>
        <p className="price-bar__note">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
