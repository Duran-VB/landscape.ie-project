import { SIZE_DIMENSIONS, type Selections } from '../../../data/pricing'

/** Continuous layout values — tweened so the garden reshapes smoothly. */
export type SceneLayout = {
  L: number // garden length, away from the house (m)
  W: number // garden width, along the house (m)
  pd: number // patio depth
  pz: number // patio height (raised terrace)
  bd: number // back border depth
  pathStart: number
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Where everything should be for a given set of selections. */
export function layoutFor(s: Selections): SceneLayout {
  const dims = s.dimensions ?? SIZE_DIMENSIONS[s.size]
  const L = clamp(dims.length, 5, 15)
  const W = clamp(dims.width, 4.5, 10)
  const pd = s.patio === 'premium' ? clamp(L * 0.34, 3, 4.8) : clamp(L * 0.27, 2.4, 3.6)
  const pz = s.patio === 'premium' ? 0.28 : 0.06
  const bd = s.planting === 'minimal' ? 0 : s.planting === 'standard' ? 1.15 : 1.7
  const pathStart = s.patio === 'none' ? 1.3 : pd + 0.4
  return { L, W, pd, pz, bd, pathStart }
}
