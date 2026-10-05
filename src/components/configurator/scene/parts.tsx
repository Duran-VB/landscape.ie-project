// Drawing primitives for the isometric garden. Pure functions of a world
// position — no state — so the scene can be re-laid-out every frame.

import type { ReactNode } from 'react'
import { GROUND_RX, GROUND_RY, SPHERE_R, pts, rand, shade, tint, type Vec3 } from './iso'
import { SHRUB_TONES, faces, type Ctx, type FaceColours, type Tone } from './palette'



/** An axis-aligned box: draws the +y face, +x face and top. */
export function Box({
  ctx,
  x0,
  x1,
  y0,
  y1,
  z0,
  z1,
  col,
}: {
  ctx: Ctx
  x0: number
  x1: number
  y0: number
  y1: number
  z0: number
  z1: number
  col: FaceColours
}) {
  const { P } = ctx
  return (
    <g>
      <polygon points={pts(P, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])} fill={col.left} />
      <polygon points={pts(P, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])} fill={col.right} />
      <polygon points={pts(P, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={col.top} />
    </g>
  )
}

/** Flat polygon lying at height z. */
export function Flat({ ctx, points, z = 0, fill, opacity, stroke, strokeWidth }: { ctx: Ctx; points: [number, number][]; z?: number; fill: string; opacity?: number; stroke?: string; strokeWidth?: number }) {
  return (
    <polygon
      points={pts(ctx.P, points.map(([x, y]) => [x, y, z] as Vec3))}
      fill={fill}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  )
}

/** Ellipse on the ground plane (a projected circle). */
export function GroundEllipse({ ctx, x, y, r, z = 0, fill, opacity, stroke, strokeWidth }: { ctx: Ctx; x: number; y: number; r: number; z?: number; fill: string; opacity?: number; stroke?: string; strokeWidth?: number }) {
  const [cx, cy] = ctx.P(x, y, z)
  return <ellipse cx={cx} cy={cy} rx={r * GROUND_RX * ctx.S} ry={r * GROUND_RY * ctx.S} fill={fill} opacity={opacity} stroke={stroke} strokeWidth={strokeWidth} />
}

export function Shadow({ ctx, x, y, r, opacity = 0.22 }: { ctx: Ctx; x: number; y: number; r: number; opacity?: number }) {
  // Light comes from the upper right, so shadows fall towards +y.
  return <GroundEllipse ctx={ctx} x={x - r * 0.05} y={y + r * 0.45} r={r * 1.08} fill={ctx.c('#28301f')} opacity={opacity} />
}

// ---- planting -------------------------------------------------------------


/** Gradient definitions for foliage tones — rendered once per scene. */
export function FoliageDefs({ ctx }: { ctx: Ctx }) {
  return (
    <>
      {(Object.keys(SHRUB_TONES) as Tone[]).map((tone) => {
        const base = SHRUB_TONES[tone]
        return (
          <radialGradient key={tone} id={`${ctx.uid}-f-${tone}`} cx="0.66" cy="0.3" r="0.78">
            <stop offset="0" stopColor={ctx.c(tint(base, 0.28))} />
            <stop offset="0.55" stopColor={ctx.c(base)} />
            <stop offset="1" stopColor={ctx.c(shade(base, 0.38))} />
          </radialGradient>
        )
      })}
    </>
  )
}

export function Shrub({ ctx, x, y, r, tone, seed = 0 }: { ctx: Ctx; x: number; y: number; r: number; tone: Tone; seed?: number }) {
  const [cx, cy] = ctx.P(x, y, r * 0.88)
  const R = r * SPHERE_R * ctx.S
  const bumps = [0, 1, 2, 3].map((i) => {
    const a = Math.PI * (0.55 + i * 0.32 + rand(seed + i, 3) * 0.1)
    return { x: cx + Math.cos(a) * R * 0.78, y: cy + Math.sin(a) * R * 0.62, r: R * (0.3 + rand(seed + i, 5) * 0.12) }
  })
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={y} r={r} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${ctx.uid}-f-${tone})`} />
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={ctx.c(shade(SHRUB_TONES[tone], 0.18))} opacity={0.55} />
      ))}
      <circle cx={cx + R * 0.32} cy={cy - R * 0.38} r={R * 0.22} fill={ctx.c(tint(SHRUB_TONES[tone], 0.4))} opacity={0.5} />
    </g>
  )
}

export function Grass({ ctx, x, y, h, colour = '#c2b07c', seed = 0, blades = 11 }: { ctx: Ctx; x: number; y: number; h: number; colour?: string; seed?: number; blades?: number }) {
  const [bx, by] = ctx.P(x, y, 0)
  const paths: ReactNode[] = []
  for (let i = 0; i < blades; i++) {
    const spread = (i / (blades - 1) - 0.5) * 2
    const len = h * ctx.S * (0.7 + rand(seed + i, 7) * 0.35)
    const tipX = bx + spread * len * 0.42 + (rand(seed + i, 9) - 0.5) * 6
    const tipY = by - len
    const ctrlX = bx + spread * len * 0.1
    const ctrlY = by - len * 0.55
    paths.push(<path key={i} d={`M${bx.toFixed(1)},${by.toFixed(1)} Q${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}`} />)
  }
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={y} r={h * 0.32} opacity={0.16} />
      <g className="sway" style={{ animationDelay: `${-rand(seed, 11) * 4}s` }} stroke={ctx.c(colour)} strokeWidth={1.5} strokeLinecap="round" fill="none">
        {paths}
      </g>
    </g>
  )
}

export function Perennial({ ctx, x, y, r, flower, seed = 0, tone = 'olive' }: { ctx: Ctx; x: number; y: number; r: number; flower: string; seed?: number; tone?: Tone }) {
  const [cx, cy] = ctx.P(x, y, r * 0.42)
  const R = r * SPHERE_R * ctx.S
  const dots = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (1.05 + rand(seed + i, 13) * 0.95)
    const d = R * (0.25 + rand(seed + i, 17) * 0.62)
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.7 }
  })
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={y} r={r * 0.9} opacity={0.18} />
      <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.74} fill={`url(#${ctx.uid}-f-${tone})`} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.3} fill={ctx.c(flower)} />
      ))}
    </g>
  )
}

export function Tree({ ctx, x, y, h, crown, tone = 'forest', trunk = '#6b5847', seed = 0, base = 0 }: { ctx: Ctx; x: number; y: number; h: number; crown: number; tone?: Tone; trunk?: string; seed?: number; base?: number }) {
  const [bx, by] = ctx.P(x, y, base)
  const [tx, ty] = ctx.P(x, y, base + h - crown * 0.6)
  const [cx, cy] = ctx.P(x, y, base + h)
  const R = crown * SPHERE_R * ctx.S
  const lobes = [
    { dx: -0.42, dy: 0.18, r: 0.68 },
    { dx: 0.44, dy: 0.12, r: 0.7 },
    { dx: 0.02, dy: -0.3, r: 0.78 },
    { dx: -0.05, dy: 0.32, r: 0.6 },
  ]
  return (
    <g>
      {base === 0 && <Shadow ctx={ctx} x={x} y={y} r={crown * 1.1} opacity={0.2} />}
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke={ctx.c(trunk)} strokeWidth={Math.max(3, ctx.S * 0.12)} strokeLinecap="round" />
      {lobes.map((l, i) => (
        <circle
          key={i}
          cx={cx + l.dx * R + (rand(seed + i, 19) - 0.5) * 4}
          cy={cy + l.dy * R}
          r={R * l.r}
          fill={`url(#${ctx.uid}-f-${tone})`}
        />
      ))}
      <circle cx={cx + R * 0.25} cy={cy - R * 0.45} r={R * 0.24} fill={ctx.c(tint(SHRUB_TONES[tone], 0.4))} opacity={0.45} />
    </g>
  )
}

/** The multi-stem feature tree that arrives with full planting. */
export function FeatureTree({ ctx, x, y, h }: { ctx: Ctx; x: number; y: number; h: number }) {
  const stems = [
    { dx: -0.5, dy: 0.15, top: 0.7 },
    { dx: 0.35, dy: -0.25, top: 0.78 },
    { dx: 0.05, dy: 0.35, top: 0.66 },
  ]
  const crowns = [
    { dx: -0.6, dy: 0.1, z: 0.72, r: 0.62 },
    { dx: 0.45, dy: -0.3, z: 0.8, r: 0.68 },
    { dx: 0.0, dy: 0.0, z: 0.98, r: 0.8 },
    { dx: 0.1, dy: 0.45, z: 0.74, r: 0.58 },
    { dx: -0.3, dy: -0.35, z: 0.9, r: 0.6 },
  ]
  const [bx, by] = ctx.P(x, y, 0)
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={y} r={1.5} opacity={0.18} />
      {stems.map((s, i) => {
        const [tx, ty] = ctx.P(x + s.dx, y + s.dy, h * s.top)
        return <path key={i} d={`M${bx},${by} Q${(bx + tx) / 2 + 2},${(by + ty) / 2} ${tx},${ty}`} stroke={ctx.c('#ddd6c8')} strokeWidth={4} strokeLinecap="round" fill="none" />
      })}
      {crowns.map((cr, i) => {
        const [cx, cy] = ctx.P(x + cr.dx, y + cr.dy, h * cr.z)
        return <circle key={i} cx={cx} cy={cy} r={cr.r * SPHERE_R * ctx.S} fill={`url(#${ctx.uid}-f-light)`} opacity={0.94} />
      })}
      {crowns.slice(0, 3).map((cr, i) => {
        const [cx, cy] = ctx.P(x + cr.dx, y + cr.dy, h * cr.z)
        return <circle key={`h${i}`} cx={cx + 6} cy={cy - 8} r={cr.r * ctx.S * 0.35} fill={ctx.c('#c9cf9f')} opacity={0.5} />
      })}
    </g>
  )
}

// ---- structures -----------------------------------------------------------

export function Bollard({ ctx, x, y }: { ctx: Ctx; x: number; y: number }) {
  const w = 0.07
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={y} r={0.12} opacity={0.25} />
      <Box ctx={ctx} x0={x - w} x1={x + w} y0={y - w} y1={y + w} z0={0} z1={0.62} col={faces(ctx.c, '#2f2f2b')} />
      <Box ctx={ctx} x0={x - w - 0.01} x1={x + w + 0.01} y0={y - w - 0.01} y1={y + w + 0.01} z0={0.46} z1={0.55} col={faces(ctx.c, '#e9dfc6')} />
    </g>
  )
}
