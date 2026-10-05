// Isometric projection + colour helpers for the garden preview.
// World units are metres: x runs away from the house, y along it, z is up.

export const ISO_X = Math.cos(Math.PI / 6) // 0.866

export type Vec3 = [number, number, number]
export type Projector = (x: number, y: number, z?: number) => [number, number]

export function makeProjector(scale: number, ox: number, oy: number): Projector {
  return (x, y, z = 0) => [ox + (x - y) * ISO_X * scale, oy + (x + y) * 0.5 * scale - z * scale]
}

/** Polygon points string for a list of world points. */
export function pts(P: Projector, list: Vec3[]): string {
  let out = ''
  for (const [x, y, z] of list) {
    const [sx, sy] = P(x, y, z)
    out += `${sx.toFixed(1)},${sy.toFixed(1)} `
  }
  return out
}

/** Ground circles project to ellipses; spheres project to circles. */
export const GROUND_RX = 1.2247
export const GROUND_RY = 0.7071
export const SPHERE_R = 1.2247

// Deterministic pseudo-random so planting looks natural but never jitters.
export function rand(i: number, salt = 0): number {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return v - Math.floor(v)
}

// ---- colour -------------------------------------------------------------

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(rgb: number[]): string {
  return `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`
}

export function mix(a: string, b: string, t: number): string {
  const A = toRgb(a)
  const B = toRgb(b)
  return toHex(A.map((v, i) => v + (B[i] - v) * t))
}

export const shade = (hex: string, t: number) => mix(hex, '#000000', t)
export const tint = (hex: string, t: number) => mix(hex, '#ffffff', t)

// Evening: colours are multiplied towards a deep blue dusk.
const DUSK = [0.25, 0.3, 0.44]

export function dusk(hex: string, t: number): string {
  if (t <= 0.001) return hex
  const A = toRgb(hex)
  return toHex(A.map((v, i) => v + (v * DUSK[i] - v) * t))
}
