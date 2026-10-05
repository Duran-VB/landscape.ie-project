import type { ReactNode } from 'react'
import { formatDelta, PRICES, type Extra } from '../../data/pricing'
import { Check, Plus } from '../ui/Icons'

type Option<T extends string> = { value: T; label: string; note: string }

/** One configurator step: number, title and a question in large type. */
export function Step({ id, number, title, question, children }: { id: string; number: string; title: string; question: string; children: ReactNode }) {
  return (
    <section className="cfg-step" id={id} aria-labelledby={`${id}-q`}>
      <p className="label cfg-step__label">
        <span>{number}</span> — {title}
      </p>
      <h3 className="serif cfg-step__question" id={`${id}-q`}>
        {question}
      </h3>
      <div className="cfg-step__body">{children}</div>
    </section>
  )
}

/** A set of mutually exclusive options rendered as tactile tiles. */
export function OptionGroup<T extends string>({
  name,
  label,
  options,
  value,
  prices,
  onChange,
  disabled = false,
  hint,
  wide = false,
}: {
  name: string
  label?: string
  options: Option<T>[]
  value: T
  prices: Record<T, number>
  onChange: (value: T) => void
  disabled?: boolean
  hint?: string
  wide?: boolean
}) {
  return (
    <fieldset className={`opt-group ${disabled ? 'is-disabled' : ''}`} disabled={disabled}>
      {label && (
        <legend className="opt-group__legend">
          <span>{label}</span>
          {disabled && hint && <span className="opt-group__hint">{hint}</span>}
        </legend>
      )}
      <div className={`opt-group__grid ${wide ? 'is-wide' : ''}`}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <label key={option.value} className={`opt ${selected ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="visually-hidden"
              />
              <span className="opt__check" aria-hidden>
                <Check />
              </span>
              <span className="opt__label">{option.label}</span>
              <span className="opt__note">{option.note}</span>
              <span className="opt__price">{formatDelta(prices[option.value])}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Optional add-ons — independent toggles. */
export function ExtrasGroup({
  options,
  selected,
  onToggle,
}: {
  options: Option<Extra>[]
  selected: Extra[]
  onToggle: (extra: Extra) => void
}) {
  return (
    <fieldset className="opt-group">
      <legend className="opt-group__legend">
        <span>Extras</span>
      </legend>
      <div className="opt-group__grid">
        {options.map((option) => {
          const on = selected.includes(option.value)
          return (
            <label key={option.value} className={`opt opt--toggle ${on ? 'is-selected' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => onToggle(option.value)} className="visually-hidden" />
              <span className="opt__check opt__check--plus" aria-hidden>
                {on ? <Check /> : <Plus />}
              </span>
              <span className="opt__label">{option.label}</span>
              <span className="opt__note">{option.note}</span>
              <span className="opt__price">{formatDelta(PRICES.extras[option.value])}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
