import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatEuro, type Selections } from '../../data/pricing'
import { setScrollLocked } from '../../lib/scroll'
import { ArrowRight, Check, Close, Upload } from '../ui/Icons'
import { EASE_EXPO } from '../ui/easing'
import { DISCLAIMER } from './PriceSummary'
import { describeSelections } from './summary'
import './QuoteForm.css'

type Values = { name: string; phone: string; email: string; area: string; timeline: string; notes: string }
type Errors = Partial<Record<keyof Values | 'photos', string>>
type PhotoUpload = { id: string; file: File; url: string }

const EMPTY: Values = { name: '', phone: '', email: '', area: '', timeline: '', notes: '' }
const TIMELINES = ['As soon as possible', 'Within 1–3 months', 'In 3–6 months', '6 months or more', 'Just exploring ideas']
const MAX_PHOTOS = 6
const MAX_BYTES = 10 * 1024 * 1024

function validate(v: Values): Errors {
  const errors: Errors = {}
  if (v.name.trim().length < 2) errors.name = 'Please enter your name.'
  const digits = v.phone.replace(/\D/g, '')
  if (!digits) errors.phone = 'Please enter a phone number.'
  else if (digits.length < 7 || !/^[+\d\s()-]+$/.test(v.phone.trim())) errors.phone = 'Please enter a valid phone number.'
  if (!v.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!v.area.trim()) errors.area = 'Please tell us your area or town.'
  if (!v.timeline) errors.timeline = 'Please choose a timeline.'
  return errors
}

/** Frontend-only enquiry form. Nothing is sent anywhere — on submit it shows
 *  a success state for the demo. */
export function QuoteForm({ open, onClose, selections, total }: { open: boolean; onClose: () => void; selections: Selections; total: number }) {
  const [values, setValues] = useState<Values>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [photoError, setPhotoError] = useState('')
  const [dragging, setDragging] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const errors = validate(values)
  const show = (field: keyof Values) => (submitted ? errors[field] : undefined)

  // Open / close housekeeping: scroll lock, focus, Escape.
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    setScrollLocked(true)
    const t = window.setTimeout(() => dialog.current?.querySelector<HTMLElement>('.quote__form input')?.focus(), 400)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [open])

  // Release object URLs when photos are removed or the form unmounts.
  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  })
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), [])

  const set = (field: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }))

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files)
    const images = incoming.filter((f) => f.type.startsWith('image/'))
    const sized = images.filter((f) => f.size <= MAX_BYTES)
    const room = MAX_PHOTOS - photos.length
    const accepted = sized.slice(0, Math.max(0, room))
    let message = ''
    if (images.length < incoming.length) message = 'Only image files can be added.'
    else if (sized.length < images.length) message = 'Each photo must be under 10 MB.'
    else if (sized.length > room) message = `You can add up to ${MAX_PHOTOS} photos.`
    setPhotoError(message)
    setPhotos((p) => [...p, ...accepted.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file, url: URL.createObjectURL(file) }))])
  }

  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const target = p.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return p.filter((x) => x.id !== id)
    })
    setPhotoError('')
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(values)
    const first = (Object.keys(errs) as (keyof Values)[])[0]
    if (first) {
      dialog.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus('sending')
    window.setTimeout(() => setStatus('done'), 1100)
  }

  const reset = () => {
    onClose()
    window.setTimeout(() => {
      setValues(EMPTY)
      setSubmitted(false)
      setStatus('idle')
      photos.forEach((p) => URL.revokeObjectURL(p.url))
      setPhotos([])
      setPhotoError('')
    }, 500)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="quote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="quote__backdrop" onClick={status === 'done' ? reset : onClose} aria-hidden />
          <motion.div
            ref={dialog}
            className="quote__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE_EXPO }}
            data-lenis-prevent
          >
            <button type="button" className="icon-btn quote__close" onClick={status === 'done' ? reset : onClose} aria-label="Close">
              <Close />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {status !== 'done' ? (
                <motion.div key="form" className="quote__layout" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                  <aside className="quote__summary on-dark">
                    <p className="label quote__eyebrow">Your garden concept</p>
                    <dl className="quote__specs">
                      {describeSelections(selections).map((row) => (
                        <div key={row.label}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="quote__price">
                      <span className="label">Estimated project price</span>
                      <strong className="serif">{formatEuro(total)}</strong>
                    </div>
                    <p className="quote__disclaimer">{DISCLAIMER}</p>
                  </aside>

                  <form className="quote__form" onSubmit={onSubmit} noValidate>
                    <h2 id="quote-title" className="display fs-m quote__title">
                      Request my <em className="caps">project quote</em>
                    </h2>
                    <p className="quote__intro">Tell us a little about you and your space. Your concept above is attached automatically.</p>

                    <div className="field-grid">
                      <Field label="Name" error={show('name')}>
                        <input name="name" autoComplete="name" value={values.name} onChange={set('name')} aria-invalid={!!show('name')} />
                      </Field>
                      <Field label="Phone" error={show('phone')}>
                        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set('phone')} aria-invalid={!!show('phone')} />
                      </Field>
                      <Field label="Email" error={show('email')}>
                        <input name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} aria-invalid={!!show('email')} />
                      </Field>
                      <Field label="Area / Town" error={show('area')}>
                        <input name="area" autoComplete="address-level2" value={values.area} onChange={set('area')} aria-invalid={!!show('area')} />
                      </Field>
                      <Field label="Project timeline" error={show('timeline')} full>
                        <select name="timeline" value={values.timeline} onChange={set('timeline')} aria-invalid={!!show('timeline')}>
                          <option value="" disabled>
                            Choose a timeline
                          </option>
                          {TIMELINES.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </Field>

                      <div className="field field--full">
                        <span className="field__label">
                          Current garden photos <span className="field__optional">Optional</span>
                        </span>
                        <div
                          className={`dropzone ${dragging ? 'is-dragging' : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setDragging(true)
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                        >
                          <Upload className="dropzone__icon" />
                          <p>
                            Drag photos here or{' '}
                            <button type="button" className="dropzone__browse" onClick={() => fileInput.current?.click()}>
                              browse
                            </button>
                          </p>
                          <p className="dropzone__hint">Up to {MAX_PHOTOS} images · 10 MB each</p>
                          <input
                            ref={fileInput}
                            type="file"
                            accept="image/*"
                            multiple
                            className="visually-hidden"
                            tabIndex={-1}
                            onChange={(e) => {
                              addFiles(e.target.files)
                              e.target.value = ''
                            }}
                          />
                        </div>
                        {photoError && <p className="field__error">{photoError}</p>}
                        {photos.length > 0 && (
                          <ul className="thumbs">
                            {photos.map((p) => (
                              <li key={p.id}>
                                <img src={p.url} alt={p.file.name} />
                                <button type="button" onClick={() => removePhoto(p.id)} aria-label={`Remove ${p.file.name}`}>
                                  <Close />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <Field label="Additional notes" optional full>
                        <textarea name="notes" rows={4} value={values.notes} onChange={set('notes')} placeholder="Anything we should know — how you’d like to use the space, access, must-haves…" />
                      </Field>
                    </div>

                    {submitted && Object.keys(errors).length > 0 && (
                      <p className="quote__form-error" role="alert">
                        Please check the highlighted fields.
                      </p>
                    )}

                    <button type="submit" className="btn btn--primary btn--block quote__submit" disabled={status === 'sending'}>
                      {status === 'sending' ? (
                        <span className="spinner" aria-label="Sending" />
                      ) : (
                        <>
                          Send project request
                          <span className="btn__icon">
                            <ArrowRight />
                          </span>
                        </>
                      )}
                    </button>
                    <p className="quote__demo">This is a demo — nothing is sent or stored.</p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  className="quote__success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE_EXPO }}
                  role="status"
                >
                  <span className="quote__tick" aria-hidden>
                    <Check />
                  </span>
                  <h2 id="quote-title" className="display fs-l">
                    Project request
                    <br />
                    <em className="caps">received</em>
                  </h2>
                  <p className="quote__success-copy">Thanks{values.name.trim() ? `, ${values.name.trim().split(' ')[0]}` : ''}. Your garden concept has been saved for this demo.</p>
                  <div className="quote__success-price">
                    <span className="label">Your estimated project investment</span>
                    <strong className="serif">{formatEuro(total)}</strong>
                  </div>
                  <p className="quote__success-note">This is only a frontend demonstration — no details have been sent.</p>
                  <button type="button" className="btn btn--dark" onClick={reset}>
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, error, optional, full, children }: { label: string; error?: string; optional?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <label className={`field ${full ? 'field--full' : ''} ${error ? 'has-error' : ''}`}>
      <span className="field__label">
        {label} {optional && <span className="field__optional">Optional</span>}
      </span>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span className="field__error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}
