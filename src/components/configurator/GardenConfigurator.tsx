import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  DEFAULT_SELECTIONS,
  OPTIONS,
  PRICES,
  calculateEstimate,
  labelFor,
  sizeFromArea,
  type Extra,
  type Selections,
} from '../../data/pricing'
import { scrollToTarget } from '../../lib/scroll'
import { ArrowRight } from '../ui/Icons'
import { EASE_EXPO, MaskLines, Reveal } from '../ui/Motion'
import { AnimatedPrice } from '../ui/AnimatedPrice'
import { ExtrasGroup, OptionGroup, Step } from './Controls'
import { GardenPreview, type Change } from './GardenPreview'
import { Breakdown, DISCLAIMER, PriceSummary } from './PriceSummary'
import { QuoteForm } from './QuoteForm'
import { describeSelections } from './summary'
import './GardenConfigurator.css'

type Single = Exclude<keyof Selections, 'extras' | 'dimensions'>

function describeChange(key: Single, value: string): string {
  const label = labelFor(key, value)
  switch (key) {
    case 'size':
      return `${label} garden`
    case 'patio':
      return value === 'none' ? 'Patio removed' : `${label} patio`
    case 'paving':
      return `${label} paving`
    case 'fencing':
      return value === 'none' ? 'Fencing removed' : `${label} fencing`
    case 'gate':
      return value === 'none' ? 'Gate removed' : `${label} gate`
    case 'planting':
      return value === 'full' ? label : `${label} planting`
    case 'lighting':
      return value === 'none' ? 'Lighting removed' : `${label} lighting — evening view`
  }
}

/** DESIGN YOUR GARDEN — choose options, watch the garden change, see the
 *  estimate update. One piece of state; the total is derived from it. */
export function GardenConfigurator() {
  const [selections, setSelections] = useState<Selections>(DEFAULT_SELECTIONS)
  const [view, setView] = useState<'configure' | 'concept'>('configure')
  const [evening, setEvening] = useState(false)
  const [change, setChange] = useState<Change | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [measureKey, setMeasureKey] = useState(0)
  const section = useRef<HTMLElement>(null)

  const { total, lines } = calculateEstimate(selections)

  // Every change does two things: it reshapes the garden and moves the price.
  // The toast names both: "Premium patio · +€6,500".
  function commit(next: Selections, text: string) {
    setSelections(next)
    setChange({ id: Date.now(), text, delta: calculateEstimate(next).total - total })
  }

  function choose<K extends Single>(key: K, value: Selections[K]) {
    if (selections[key] === value) return
    const next: Selections = { ...selections, [key]: value }
    if (key === 'fencing' && value === 'none') next.gate = 'none'
    if (key === 'size') {
      next.dimensions = null
      setMeasureKey((k) => k + 1)
    }
    if (key === 'lighting') setEvening(value !== 'none')
    commit(next, describeChange(key, value))
  }

  function toggleExtra(extra: Extra) {
    const on = selections.extras.includes(extra)
    const extras = on ? selections.extras.filter((e) => e !== extra) : [...selections.extras, extra]
    commit({ ...selections, extras }, `${labelFor('extras', extra)} ${on ? 'removed' : 'added'}`)
  }

  function setDimensions(dimensions: Selections['dimensions']) {
    if (!dimensions) {
      setSelections((prev) => ({ ...prev, dimensions: null }))
      return
    }
    const area = dimensions.length * dimensions.width
    const size = sizeFromArea(area)
    commit({ ...selections, dimensions, size }, `≈ ${Math.round(area)} m² · ${labelFor('size', size)} garden`)
  }

  const goTo = (next: 'configure' | 'concept') => {
    setView(next)
    if (section.current) scrollToTarget(section.current, -40)
  }

  const startAgain = () => {
    setSelections(DEFAULT_SELECTIONS)
    setEvening(false)
    setMeasureKey((k) => k + 1)
    setChange(null)
    goTo('configure')
  }

  return (
    <section id="design" ref={section} className="cfg bg-paper">
      <div className="container">
        <div className={`cfg__head ${view === 'concept' ? 'is-collapsed' : ''}`} aria-hidden={view === 'concept'}>
          <div>
            <Reveal>
              <p className="label eyebrow cfg__eyebrow">The garden configurator</p>
            </Reveal>
            <MaskLines className="display fs-xxl" lines={['Design your', <em key="g" className="caps">garden.</em>]} />
          </div>
          <Reveal className="cfg__promise" delay={0.1}>
            <ol>
              <li>
                <span className="label">01</span> Choose what you want.
              </li>
              <li>
                <span className="label">02</span> See how it changes.
              </li>
              <li>
                <span className="label">03</span> See what it could cost.
              </li>
            </ol>
          </Reveal>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {view === 'configure' ? (
            <motion.div
              key="configure"
              className="cfg__grid"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
            >
              <div className="cfg__visual">
                <GardenPreview selections={selections} evening={evening} onEveningChange={setEvening} change={change} />
                <PriceSummary total={total} lines={lines} />
              </div>

              <div className="cfg__controls">
                <p className="cfg__disclaimer">{DISCLAIMER}</p>

                <Step id="step-size" number="01" title="Size" question="How large is your garden?">
                  <OptionGroup name="size" options={OPTIONS.size} value={selections.size} prices={PRICES.gardenSize} onChange={(v) => choose('size', v)} />
                  <Measure key={measureKey} onChange={setDimensions} />
                </Step>

                <Step id="step-foundation" number="02" title="Foundation" question="What would you like underfoot?">
                  <OptionGroup name="patio" label="Patio" options={OPTIONS.patio} value={selections.patio} prices={PRICES.patio} onChange={(v) => choose('patio', v)} />
                  <OptionGroup
                    name="paving"
                    label="Paving"
                    options={OPTIONS.paving}
                    value={selections.paving}
                    prices={PRICES.paving}
                    onChange={(v) => choose('paving', v)}
                    disabled={selections.patio === 'none'}
                    hint="Add a patio to choose paving"
                  />
                </Step>

                <Step id="step-boundaries" number="03" title="Boundaries" question="How should it be enclosed?">
                  <OptionGroup name="fencing" label="Fencing" options={OPTIONS.fencing} value={selections.fencing} prices={PRICES.fencing} onChange={(v) => choose('fencing', v)} />
                  <OptionGroup
                    name="gate"
                    label="Gate"
                    options={OPTIONS.gate}
                    value={selections.gate}
                    prices={PRICES.gate}
                    onChange={(v) => choose('gate', v)}
                    disabled={selections.fencing === 'none'}
                    hint="Add fencing to include a gate"
                  />
                </Step>

                <Step id="step-planting" number="04" title="Planting" question="How green should it feel?">
                  <OptionGroup name="planting" options={OPTIONS.planting} value={selections.planting} prices={PRICES.planting} onChange={(v) => choose('planting', v)} />
                </Step>

                <Step id="step-finishing" number="05" title="Finishing touches" question="The details that make it yours.">
                  <OptionGroup name="lighting" label="Outdoor lighting" options={OPTIONS.lighting} value={selections.lighting} prices={PRICES.lighting} onChange={(v) => choose('lighting', v)} />
                  <ExtrasGroup options={OPTIONS.extras} selected={selections.extras} onToggle={toggleExtra} />
                </Step>

                <div className="cfg__finish">
                  <div className="cfg__finish-total">
                    <span className="label">Estimated project price</span>
                    <AnimatedPrice value={total} className="cfg__finish-price" />
                  </div>
                  <button type="button" className="btn btn--dark btn--block" onClick={() => goTo('concept')}>
                    View my garden concept
                    <span className="btn__icon">
                      <ArrowRight />
                    </span>
                  </button>
                  <button type="button" className="link cfg__reset" onClick={startAgain}>
                    Start again
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="concept"
              className="concept"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
            >
              <MaskLines className="display fs-xl concept__title" lines={['Your garden concept', <em key="r" className="caps">is ready.</em>]} onMount delay={0.2} />

              <div className="concept__grid">
                <GardenPreview selections={selections} evening={evening} onEveningChange={setEvening} className="concept__preview" />

                <div className="concept__summary">
                  <dl className="concept__specs">
                    {describeSelections(selections).map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <Breakdown lines={lines} total={total} showTotal={false} />

                  <div className="concept__total">
                    <p className="label">Estimated project price</p>
                    <AnimatedPrice value={total} className="concept__price" />
                  </div>
                  <p className="concept__explain">
                    This gives you an indication of the investment required for a project like this. We’ll confirm the final
                    scope and price after understanding your space properly.
                  </p>
                  <p className="concept__note">{DISCLAIMER}</p>

                  <div className="concept__actions">
                    <button type="button" className="btn btn--primary" onClick={() => setQuoteOpen(true)}>
                      Request My Project Quote
                      <span className="btn__icon">
                        <ArrowRight />
                      </span>
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={startAgain}>
                      Start Again
                    </button>
                  </div>
                  <button type="button" className="link concept__edit" onClick={() => goTo('configure')}>
                    Edit my design
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QuoteForm open={quoteOpen} onClose={() => setQuoteOpen(false)} selections={selections} total={total} />
    </section>
  )
}

/** Optional length × width input that works out the approximate area. */
function Measure({ onChange }: { onChange: (dims: Selections['dimensions']) => void }) {
  const [open, setOpen] = useState(false)
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')

  const update = (nextLength: string, nextWidth: string) => {
    setLength(nextLength)
    setWidth(nextWidth)
    const l = parseFloat(nextLength)
    const w = parseFloat(nextWidth)
    const valid = l >= 2 && l <= 80 && w >= 2 && w <= 80
    onChange(valid ? { length: Math.round(l * 10) / 10, width: Math.round(w * 10) / 10 } : null)
  }

  const l = parseFloat(length)
  const w = parseFloat(width)
  const area = l > 0 && w > 0 ? Math.round(l * w) : null

  return (
    <div className="measure">
      <button type="button" className="measure__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>Know your measurements?</span>
        <span className="measure__plus" aria-hidden>
          {open ? '–' : '+'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="measure__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="measure__inputs">
              <label>
                <span className="label">Length (m)</span>
                <input inputMode="decimal" type="number" min={2} max={80} step={0.5} placeholder="11" value={length} onChange={(e) => update(e.target.value, width)} />
              </label>
              <span className="measure__x" aria-hidden>
                ×
              </span>
              <label>
                <span className="label">Width (m)</span>
                <input inputMode="decimal" type="number" min={2} max={80} step={0.5} placeholder="8" value={width} onChange={(e) => update(length, e.target.value)} />
              </label>
              <p className="measure__area" aria-live="polite">
                {area ? (
                  <>
                    ≈ <strong>{area} m²</strong>
                    <span>{labelFor('size', sizeFromArea(area))} garden</span>
                  </>
                ) : (
                  <span>Approximate area</span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
