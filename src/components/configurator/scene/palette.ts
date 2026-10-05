import { shade, tint, type Projector } from './iso'

/** Everything a drawing primitive needs to place and colour itself. */
export type Ctx = {
  P: Projector
  /** Colour transform (applies the evening dusk). */
  c: (hex: string) => string
  /** Unique prefix for gradient ids. */
  uid: string
  /** Pixels per metre. */
  S: number
}

export type FaceColours = { top: string; left: string; right: string }

/** Shade a base colour into the three visible faces of a box. */
export function faces(c: Ctx['c'], base: string, topTint = 0): FaceColours {
  return { top: c(topTint ? tint(base, topTint) : base), left: c(shade(base, 0.24)), right: c(shade(base, 0.09)) }
}

export const SHRUB_TONES = {
  deep: '#34493a',
  forest: '#425d44',
  olive: '#69794b',
  sage: '#8e9d72',
  light: '#a8b47f',
  silver: '#a9b2a0',
} as const
export type Tone = keyof typeof SHRUB_TONES

export const FLOWERS = ['#d9a7ad', '#ad9ec9', '#f2ead6', '#d0915f', '#e4c66f']
