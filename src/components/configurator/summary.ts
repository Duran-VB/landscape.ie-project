import { labelFor, type Selections } from '../../data/pricing'

/** Human-readable list of the current selections (concept view + quote form). */
export function describeSelections(s: Selections): { label: string; value: string }[] {
  const area = s.dimensions ? ` · ${s.dimensions.length} × ${s.dimensions.width} m` : ''
  return [
    { label: 'Garden size', value: `${labelFor('size', s.size)}${area}` },
    { label: 'Patio', value: labelFor('patio', s.patio) },
    { label: 'Paving', value: s.patio === 'none' ? '—' : labelFor('paving', s.paving) },
    { label: 'Fencing', value: labelFor('fencing', s.fencing) },
    { label: 'Gate', value: s.fencing === 'none' ? '—' : labelFor('gate', s.gate) },
    { label: 'Planting', value: labelFor('planting', s.planting) },
    { label: 'Lighting', value: labelFor('lighting', s.lighting) },
    { label: 'Extras', value: s.extras.length ? s.extras.map((e) => labelFor('extras', e)).join(', ') : 'None' },
  ]
}
