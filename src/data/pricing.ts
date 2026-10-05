// ---------------------------------------------------------------------------
// Garden configurator — demo pricing.
//
// Every price used by "Design Your Garden" lives in PRICES below. Change a
// number here and the configurator, breakdown, concept summary and quote form
// all update. The estimate is simply:
//
//   basePrice + gardenSize + patio + paving + fencing + gate
//             + planting + lighting + each selected extra
//
// These are illustrative demo figures only — not a quotation.
// ---------------------------------------------------------------------------

export const PRICES = {
  basePrice: 8000, // design, site preparation, groundwork and lawn
  gardenSize: { small: 0, medium: 4000, large: 9000 },
  patio: { none: 0, standard: 4000, premium: 6500 },
  paving: { standard: 0, naturalStone: 2000, porcelain: 2500 }, // only with a patio
  fencing: { none: 0, timber: 2500, premiumTimber: 4000 },
  gate: { none: 0, standard: 650, premium: 1200 }, // only with fencing
  planting: { minimal: 0, standard: 2000, full: 3800 },
  lighting: { none: 0, standard: 1500, premium: 2600 },
  extras: { raisedBeds: 1400, steps: 1100, seating: 1800 },
}

export type GardenSize = keyof typeof PRICES.gardenSize
export type PatioLevel = keyof typeof PRICES.patio
export type Paving = keyof typeof PRICES.paving
export type Fencing = keyof typeof PRICES.fencing
export type Gate = keyof typeof PRICES.gate
export type Planting = keyof typeof PRICES.planting
export type Lighting = keyof typeof PRICES.lighting
export type Extra = keyof typeof PRICES.extras

/** The single piece of configurator state. */
export type Selections = {
  size: GardenSize
  patio: PatioLevel
  paving: Paving
  fencing: Fencing
  gate: Gate
  planting: Planting
  lighting: Lighting
  extras: Extra[]
  /** Optional measurements in metres (length from the house × width). */
  dimensions: { length: number; width: number } | null
}

export const DEFAULT_SELECTIONS: Selections = {
  size: 'medium',
  patio: 'none',
  paving: 'standard',
  fencing: 'none',
  gate: 'none',
  planting: 'minimal',
  lighting: 'none',
  extras: [],
  dimensions: null,
}

// Labels and one-line notes shown on each option.
type Option<T extends string> = { value: T; label: string; note: string }

export const OPTIONS = {
  size: [
    { value: 'small', label: 'Small', note: 'Up to ~50 m²' },
    { value: 'medium', label: 'Medium', note: '~50 – 120 m²' },
    { value: 'large', label: 'Large', note: '120 m² +' },
  ] as Option<GardenSize>[],
  patio: [
    { value: 'none', label: 'None', note: 'Lawn to the house' },
    { value: 'standard', label: 'Standard', note: 'Patio off the house' },
    { value: 'premium', label: 'Premium', note: 'Larger raised terrace' },
  ] as Option<PatioLevel>[],
  paving: [
    { value: 'standard', label: 'Standard', note: 'Classic paving slabs' },
    { value: 'naturalStone', label: 'Natural Stone', note: 'Warm, varied tones' },
    { value: 'porcelain', label: 'Porcelain', note: 'Large-format, crisp' },
  ] as Option<Paving>[],
  fencing: [
    { value: 'none', label: 'None', note: 'Keep the boundary' },
    { value: 'timber', label: 'Timber', note: 'Close-board fencing' },
    { value: 'premiumTimber', label: 'Premium Timber', note: 'Horizontal slatted' },
  ] as Option<Fencing>[],
  gate: [
    { value: 'none', label: 'None', note: 'No side gate' },
    { value: 'standard', label: 'Standard', note: 'Matching timber' },
    { value: 'premium', label: 'Premium', note: 'Framed & slatted' },
  ] as Option<Gate>[],
  planting: [
    { value: 'minimal', label: 'Minimal', note: 'A few key shrubs' },
    { value: 'standard', label: 'Standard', note: 'Planted borders' },
    { value: 'full', label: 'Full Garden Planting', note: 'Layered borders & a feature tree' },
  ] as Option<Planting>[],
  lighting: [
    { value: 'none', label: 'None', note: 'No outdoor lighting' },
    { value: 'standard', label: 'Standard', note: 'Path & wall lights' },
    { value: 'premium', label: 'Premium', note: 'Plus uplights & festoon' },
  ] as Option<Lighting>[],
  extras: [
    { value: 'raisedBeds', label: 'Raised Beds', note: 'Timber planters' },
    { value: 'steps', label: 'Garden Steps', note: 'Down from the house' },
    { value: 'seating', label: 'Seating Area', note: 'A place to gather' },
  ] as Option<Extra>[],
}

type Group = keyof typeof OPTIONS

export function labelFor(group: Group, value: string): string {
  const match = (OPTIONS[group] as Option<string>[]).find((o) => o.value === value)
  return match ? match.label : value
}

/** Garden dimensions (metres) used by the visual preview for each size. */
export const SIZE_DIMENSIONS: Record<GardenSize, { length: number; width: number }> = {
  small: { length: 8, width: 6 },
  medium: { length: 11, width: 8 },
  large: { length: 14, width: 10 },
}

export function sizeFromArea(area: number): GardenSize {
  if (area < 50) return 'small'
  if (area <= 120) return 'medium'
  return 'large'
}

export type BreakdownLine = { key: string; label: string; detail: string; amount: number }

/** Base price + every selected option. That's the whole calculation. */
export function calculateEstimate(s: Selections): { total: number; lines: BreakdownLine[] } {
  const lines: BreakdownLine[] = [
    { key: 'base', label: 'Base project', detail: 'Design, groundwork & lawn', amount: PRICES.basePrice },
    { key: 'size', label: 'Garden size', detail: labelFor('size', s.size), amount: PRICES.gardenSize[s.size] },
  ]

  if (s.patio !== 'none') {
    lines.push({ key: 'patio', label: 'Patio', detail: labelFor('patio', s.patio), amount: PRICES.patio[s.patio] })
    lines.push({ key: 'paving', label: 'Paving', detail: labelFor('paving', s.paving), amount: PRICES.paving[s.paving] })
  }

  if (s.fencing !== 'none') {
    lines.push({ key: 'fencing', label: 'Fencing', detail: labelFor('fencing', s.fencing), amount: PRICES.fencing[s.fencing] })
    if (s.gate !== 'none') {
      lines.push({ key: 'gate', label: 'Gate', detail: labelFor('gate', s.gate), amount: PRICES.gate[s.gate] })
    }
  }

  lines.push({ key: 'planting', label: 'Planting', detail: labelFor('planting', s.planting), amount: PRICES.planting[s.planting] })

  if (s.lighting !== 'none') {
    lines.push({ key: 'lighting', label: 'Lighting', detail: labelFor('lighting', s.lighting), amount: PRICES.lighting[s.lighting] })
  }

  for (const extra of OPTIONS.extras) {
    if (s.extras.includes(extra.value)) {
      lines.push({ key: extra.value, label: extra.label, detail: 'Finishing touch', amount: PRICES.extras[extra.value] })
    }
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0)
  return { total, lines }
}

const euro = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatEuro(value: number): string {
  return euro.format(value)
}

export function formatDelta(value: number): string {
  if (value === 0) return 'Included'
  return `${value > 0 ? '+' : '−'}${formatEuro(Math.abs(value))}`
}
