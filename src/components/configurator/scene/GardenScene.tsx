import { useId, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Selections } from '../../../data/pricing'
import type { SceneLayout } from './layout'
import { GROUND_RX, GROUND_RY, ISO_X, dusk, makeProjector, mix, pts, rand, shade, tint } from './iso'
import { FLOWERS, faces, type Ctx, type Tone } from './palette'
import { Bollard, Box, FeatureTree, Flat, FoliageDefs, Grass, GroundEllipse, Perennial, Shadow, Shrub, Tree } from './parts'

const S = 44 // pixels per metre
const T = 0.6 // depth of the cut-away ground slab
const FENCE_H = 1.8
const HOUSE_H = 3.1
const FLOOR = 0.62
const EASE = [0.22, 1, 0.36, 1] as const

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

const COL = {
  lawn: '#97a670',
  lawnStripe: '#a4b27e',
  lawnEdge: '#809259',
  topsoil: '#6f5a45',
  subsoil: '#5e4c3a',
  base: '#8f8676',
  mulch: '#5c4a3a',
  stone: '#d4ccbe',
  gravel: '#dcd0b7',
  gravelDot: '#bfb194',
  wall: '#f6f1e7',
  plinth: '#cec5b3',
  frame: '#2b2b28',
  coping: '#3d3c38',
  foundation: '#a39b8e',
  timber: '#8e6d4d',
  timberDark: '#765a3f',
  slat: '#a87b53',
  slatGap: '#3b3027',
  charcoal: '#2e2e2a',
  bedTimber: '#9d7854',
  soil: '#4f3f30',
  veg: '#86a45a',
  cushion: '#ece5d7',
  corten: '#9c5b35',
}

const PAVING = {
  standard: { top: '#d0c9bb', joint: '#b1a999', side: '#beb6a6' },
  naturalStone: { top: '#d3bd99', joint: '#a48e6c', side: '#c0a985' },
  porcelain: { top: '#cbc9c2', joint: '#aeaba3', side: '#b6b3ab' },
}
const STONE_TONES = ['#d9c5a3', '#cbb28d', '#e1cfae', '#c3a983', '#d3bd98', '#bea37d']

export function GardenScene({ s, layout, evening }: { s: Selections; layout: SceneLayout; evening: number }) {
  const uid = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { L, W, pd, pz, bd, pathStart } = layout

  // Keep the plot centred in the frame as it grows and shrinks.
  const midX = ((L - W) / 2) * ISO_X * S
  const midY = (((L + W) * 0.5 + T - 2.3) / 2) * S
  const P = makeProjector(S, 500 - midX, 392 - midY)
  const c = (hex: string) => dusk(hex, evening)
  const ctx: Ctx = { P, c, uid, S }

  // ---- site plan ------------------------------------------------------
  const houseY0 = W * 0.36
  const doorY0 = houseY0 + (W - houseY0) * 0.28
  const doorY1 = doorY0 + Math.min(2.6, (W - houseY0) * 0.46)
  const patioY0 = houseY0 + 0.05
  const patioY1 = W - 0.25
  const gateY0 = Math.max(0.3, houseY0 / 2 - 0.5)
  const gateY1 = gateY0 + Math.min(1, houseY0 - 0.6)

  const hasPatio = s.patio !== 'none'
  const premiumPatio = s.patio === 'premium'
  const hasFence = s.fencing !== 'none'
  const has = (extra: Selections['extras'][number]) => s.extras.includes(extra)
  const lights = s.lighting
  const paving = PAVING[s.paving]

  const seatR = clamp(W * 0.17, 1.1, 1.6)
  const seatX = L - seatR - 0.75
  const seatY = W - seatR - 1.0
  const pathY = seatY
  const pathEnd = has('seating') ? seatX - seatR - 0.2 : L - 1.6
  const stepsY0 = doorY0 + 0.25
  const stepsY1 = Math.min(doorY1 - 0.25, stepsY0 + 1.7)
  const stepsBase = hasPatio ? pz : 0

  // ---- ground beds ----------------------------------------------------
  const ground: { key: string; node: ReactNode }[] = []

  if (s.planting === 'minimal') {
    const arc: [number, number][] = [[L, 0]]
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * (Math.PI / 2)
      arc.push([L - 2.5 * Math.cos(a), 1.9 * Math.sin(a)])
    }
    ground.push({ key: 'bed-corner', node: <Flat ctx={ctx} points={arc} z={0.005} fill={c(COL.mulch)} /> })
  }

  if (bd > 0.05) {
    const edge: [number, number][] = [[1.5, 0], [L, 0]]
    if (s.planting === 'full') edge.push([L, W * 0.45])
    const startX = s.planting === 'full' ? L - 1.15 : L
    for (let x = startX; x >= 1.5; x -= 0.25) edge.push([x, bd + Math.sin(x * 0.9) * 0.16 * Math.min(1, bd)])
    ground.push({ key: 'bed-back', node: <Flat ctx={ctx} points={edge} z={0.005} fill={c(COL.mulch)} /> })
  }

  const frontStart = (hasPatio ? pd : 0) + 0.6
  if (s.planting === 'full') {
    const front: [number, number][] = []
    for (let x = frontStart; x <= L; x += 0.25) front.push([x, W - 0.82 - Math.sin(x * 1.1) * 0.1])
    front.push([L, W], [frontStart, W])
    ground.push({ key: 'bed-front', node: <Flat ctx={ctx} points={front} z={0.005} fill={c(COL.mulch)} /> })
  }

  // Stepping stones towards the far end of the garden.
  const stones: ReactNode[] = []
  for (let x = pathStart, i = 0; x + 0.45 <= pathEnd; x += 0.82, i++) {
    stones.push(
      <Flat
        key={i}
        ctx={ctx}
        points={[[x, pathY - 0.45], [x + 0.46, pathY - 0.45], [x + 0.46, pathY + 0.45], [x, pathY + 0.45]]}
        z={0.01}
        fill={c(i % 2 ? COL.stone : tint(COL.stone, 0.06))}
      />,
    )
  }

  // ---- objects (depth sorted) ------------------------------------------
  type Obj = { key: string; depth: number; node: ReactNode; delay?: number }
  const objects: Obj[] = []
  const plant = (key: string, x: number, y: number, node: ReactNode, i = 0) => objects.push({ key, depth: x + y, node, delay: i * 0.035 })

  const tones: Tone[] = ['forest', 'olive', 'sage', 'deep', 'light']

  if (s.planting === 'minimal') {
    plant('m1', L - 0.6, 0.6, <Shrub ctx={ctx} x={L - 0.6} y={0.6} r={0.62} tone="forest" seed={1} />)
    plant('m2', L - 1.65, 0.5, <Shrub ctx={ctx} x={L - 1.65} y={0.5} r={0.44} tone="olive" seed={2} />, 1)
    plant('m3', L - 0.7, 1.4, <Grass ctx={ctx} x={L - 0.7} y={1.4} h={0.95} seed={3} />, 2)
    plant('m4', L - 1.5, 1.15, <Shrub ctx={ctx} x={L - 1.5} y={1.15} r={0.3} tone="sage" seed={4} />, 3)
  }

  if (s.planting === 'standard') {
    let i = 0
    for (let x = 2.0; x <= L - 0.45; x += 1.05, i++) {
      const y = bd * 0.5 + (rand(i, 1) - 0.5) * 0.2
      if (i % 3 === 1) plant(`s${i}`, x, y, <Grass ctx={ctx} x={x} y={y} h={1.0} seed={i} />, i)
      else plant(`s${i}`, x, y, <Shrub ctx={ctx} x={x} y={y} r={0.42 + rand(i, 2) * 0.16} tone={tones[i % 3]} seed={i} />, i)
    }
    plant('s-tree', L * 0.56, bd * 0.42, <Tree ctx={ctx} x={L * 0.56} y={bd * 0.42} h={2.7} crown={0.78} tone="olive" seed={5} />, 2)
  }

  if (s.planting === 'full') {
    let i = 0
    for (let x = 1.9; x <= L - 1.5; x += 0.92, i++) {
      const y = bd * 0.3
      if (i % 2 === 0) plant(`fb${i}`, x, y, <Shrub ctx={ctx} x={x} y={y} r={0.55 + rand(i, 4) * 0.16} tone={tones[i % 4]} seed={i} />, i)
      else plant(`fb${i}`, x, y, <Grass ctx={ctx} x={x} y={y} h={1.35} colour={i % 4 === 1 ? '#c6b27a' : '#a9a66d'} seed={i} blades={13} />, i)
    }
    i = 0
    for (let x = 2.35; x <= L - 1.6; x += 0.92, i++) {
      const y = bd * 0.76
      plant(`ff${i}`, x, y, <Perennial ctx={ctx} x={x} y={y} r={0.36 + rand(i, 6) * 0.08} flower={FLOWERS[i % FLOWERS.length]} seed={i} tone={i % 2 ? 'olive' : 'sage'} />, i + 2)
    }
    i = 0
    for (let y = bd + 0.55; y <= W * 0.45 - 0.2; y += 0.85, i++) {
      plant(`fr${i}`, L - 0.55, y, i % 2 ? <Grass ctx={ctx} x={L - 0.55} y={y} h={0.9} seed={i + 40} /> : <Perennial ctx={ctx} x={L - 0.55} y={y} r={0.36} flower={FLOWERS[(i + 2) % FLOWERS.length]} seed={i + 40} />, i + 4)
    }
    i = 0
    for (let x = frontStart + 0.45; x <= L - 0.3; x += 0.82, i++) {
      const y = W - 0.42
      plant(`fn${i}`, x, y, i % 3 === 2 ? <Grass ctx={ctx} x={x} y={y} h={0.62} seed={i + 60} blades={9} /> : <Perennial ctx={ctx} x={x} y={y} r={0.3} flower={FLOWERS[(i + 1) % FLOWERS.length]} seed={i + 60} tone={i % 2 ? 'sage' : 'olive'} />, i + 6)
    }
    plant('f-feature', L - 1.05, 0.95, <FeatureTree ctx={ctx} x={L - 1.05} y={0.95} h={4.1} />, 3)
    plant('f-tree', L * 0.36, bd * 0.38, <Tree ctx={ctx} x={L * 0.36} y={bd * 0.38} h={3.1} crown={0.92} tone="forest" seed={9} />, 4)
  }

  if (premiumPatio) {
    const x0 = pd - 1.05
    const y0 = patioY0 + 0.32
    objects.push({
      key: 'planter',
      depth: x0 + y0 + 1,
      node: (
        <g>
          <Box ctx={ctx} x0={x0} x1={x0 + 0.75} y0={y0} y1={y0 + 0.7} z0={pz} z1={pz + 0.5} col={faces(c, '#43413c')} />
          <Tree ctx={ctx} x={x0 + 0.37} y={y0 + 0.35} h={1.65} crown={0.48} tone="silver" base={pz + 0.48} seed={21} />
        </g>
      ),
    })
  }

  if (has('raisedBeds')) {
    const start = Math.max((hasPatio ? pd : 0) + 0.9, 2.2)
    const limit = has('seating') ? seatX - seatR - 0.4 : s.planting === 'minimal' ? L - 2.9 : L - 1.0
    const count = clamp(Math.floor((limit - start + 0.6) / 1.9), 1, 3)
    const y0 = (bd > 0.05 ? bd : 0.3) + 0.35
    for (let i = 0; i < count; i++) {
      const x0 = start + i * 1.9
      objects.push({ key: `rb${i}`, depth: x0 + y0 + 1, delay: i * 0.08, node: <RaisedBed ctx={ctx} x0={x0} y0={y0} seed={i} /> })
    }
  }

  if (has('seating')) {
    objects.push({ key: 'seating', depth: seatX + seatY, node: <SeatingSet ctx={ctx} x={seatX} y={seatY} r={seatR} /> })
  }

  if (has('steps')) {
    objects.push({
      key: 'steps',
      depth: 0.4 + (stepsY0 + stepsY1) / 2,
      node: <Steps ctx={ctx} y0={stepsY0} y1={stepsY1} base={stepsBase} colour="#e4ded1" />,
    })
  }

  // Lighting fixtures
  const bollards: [number, number][] = []
  if (lights !== 'none') {
    const edgeX = hasPatio ? pd + 0.22 : 1.1
    bollards.push([edgeX, patioY0 + 0.25], [edgeX, patioY1 - 0.15])
    const span = pathEnd - pathStart
    if (span > 2) {
      bollards.push([pathStart + span * 0.35, pathY - 0.8], [pathStart + span * 0.75, pathY - 0.8])
    }
    bollards.forEach(([x, y], i) => objects.push({ key: `bo${i}`, depth: x + y, delay: i * 0.06, node: <Bollard ctx={ctx} x={x} y={y} /> }))
  }

  objects.sort((a, b) => a.depth - b.depth)

  // Uplit trees (premium lighting)
  const uplights: [number, number, number][] = []
  if (lights === 'premium') {
    if (s.planting === 'full') uplights.push([L - 1.05, 0.95, 3.6], [L * 0.36, bd * 0.38, 2.8])
    else if (s.planting === 'standard') uplights.push([L * 0.56, bd * 0.42, 2.4])
    else uplights.push([L - 0.6, 0.6, 1.2])
  }

  // Festoon run over the patio (premium lighting)
  const festoonX = hasPatio ? pd + 0.35 : 2.4
  const festoonPosts: [number, number][] = [
    [festoonX, patioY0 + 0.5],
    [festoonX, patioY1 - 0.45],
  ]
  const festoonRuns: [[number, number, number], [number, number, number]][] = [
    [[0, doorY0 - 0.25, 2.7], [festoonPosts[0][0], festoonPosts[0][1], 2.4]],
    [[festoonPosts[0][0], festoonPosts[0][1], 2.4], [festoonPosts[1][0], festoonPosts[1][1], 2.4]],
    [[festoonPosts[1][0], festoonPosts[1][1], 2.4], [0, W - 0.35, 2.7]],
  ]
  const festoonBulbs = festoonRuns.flatMap(([a, b], run) => {
    const [ax, ay] = P(...a)
    const [bx, by] = P(...b)
    const qx = (ax + bx) / 2
    const qy = (ay + by) / 2 + 22
    return Array.from({ length: 7 }, (_, i) => {
      const t = (i + 1) / 8
      return {
        key: `${run}-${i}`,
        x: (1 - t) ** 2 * ax + 2 * (1 - t) * t * qx + t * t * bx,
        y: (1 - t) ** 2 * ay + 2 * (1 - t) * t * qy + t * t * by,
        path: `M${ax},${ay} Q${qx},${qy} ${bx},${by}`,
      }
    })
  })

  const wallLights: [number, number][] = lights !== 'none' ? [[doorY0 - 0.32, 2.15], [doorY1 + 0.32, 2.15]] : []

  // ---- render ---------------------------------------------------------
  const [shadowX, shadowY] = P(L / 2, W / 2, -T)
  const label = `Illustrative ${s.size} garden${hasPatio ? ` with a ${s.patio} patio` : ''}${hasFence ? ', fencing' : ''}, ${s.planting} planting${lights !== 'none' ? ', outdoor lighting' : ''}`

  return (
    <svg className="scene" viewBox="0 0 1000 760" role="img" aria-label={label}>
      <defs>
        <FoliageDefs ctx={ctx} />
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0" stopColor={c('#3a3424')} stopOpacity="0.34" />
          <stop offset="1" stopColor={c('#3a3424')} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#fff4d6" stopOpacity="1" />
          <stop offset="0.22" stopColor="#ffd690" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffb760" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-fire`}>
          <stop offset="0" stopColor="#ffe0a0" stopOpacity="1" />
          <stop offset="0.3" stopColor="#ff9d4a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd690" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd690" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c('#4a5856')} />
          <stop offset="1" stopColor={c('#262f2d')} />
        </linearGradient>
        <linearGradient id={`${uid}-warm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe2a8" />
          <stop offset="1" stopColor="#f2a75c" />
        </linearGradient>
      </defs>

      {/* Soft shadow under the model */}
      <ellipse cx={shadowX} cy={shadowY + 26} rx={(L + W) * ISO_X * S * 0.56} ry={(L + W) * S * 0.13} fill={`url(#${uid}-shadow)`} />

      <Slab ctx={ctx} L={L} W={W} />

      <AnimatePresence initial={false}>
        {ground.map((g) => (
          <Fade key={g.key}>{g.node}</Fade>
        ))}
      </AnimatePresence>

      <g>{stones}</g>

      <AnimatePresence initial={false}>
        {has('seating') && (
          <Fade key="pad">
            <SeatingPad ctx={ctx} x={seatX} y={seatY} r={seatR} />
          </Fade>
        )}
      </AnimatePresence>

      <House ctx={ctx} W={W} houseY0={houseY0} doorY0={doorY0} doorY1={doorY1} wallLights={wallLights} />

      <AnimatePresence initial={false}>
        {hasFence && (
          <Fade key={`fence-${s.fencing}`}>
            <FenceRun ctx={ctx} along="x" from={0} to={L} premium={s.fencing === 'premiumTimber'} />
            <FenceRun ctx={ctx} along="y" from={0} to={houseY0} premium={s.fencing === 'premiumTimber'} />
          </Fade>
        )}
        {hasFence && s.gate !== 'none' && (
          <Rise key={`gate-${s.gate}`}>
            <Gate ctx={ctx} y0={gateY0} y1={gateY1} premium={s.gate === 'premium'} />
          </Rise>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {hasPatio && (
          <Rise key="patio">
            <Box ctx={ctx} x0={0} x1={pd} y0={patioY0} y1={patioY1} z0={0} z1={pz} col={faces(c, paving.side)} />
            <AnimatePresence initial={false}>
              <Fade key={`paving-${s.paving}`}>
                <PatioSurface ctx={ctx} paving={s.paving} x1={pd} y0={patioY0} y1={patioY1} z={pz} />
              </Fade>
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {premiumPatio && (
                <Fade key="border">
                  <PatioBorder ctx={ctx} x1={pd} y0={patioY0} y1={patioY1} z={pz} />
                </Fade>
              )}
            </AnimatePresence>
          </Rise>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {objects.map((o) => (
          <Rise key={o.key} delay={o.delay}>
            {o.node}
          </Rise>
        ))}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {lights === 'premium' && (
          <Fade key="festoon">
            {festoonPosts.map(([x, y], i) => (
              <Box key={i} ctx={ctx} x0={x - 0.05} x1={x + 0.05} y0={y - 0.05} y1={y + 0.05} z0={0} z1={2.45} col={faces(c, COL.charcoal)} />
            ))}
            {festoonRuns.map((_, run) => (
              <path key={run} d={festoonBulbs[run * 7].path} stroke={c('#2a2a26')} strokeWidth={1} fill="none" />
            ))}
            {festoonBulbs.map((b) => (
              <circle key={b.key} cx={b.x} cy={b.y + 2.5} r={2.3} fill={mix('#f3ead6', '#ffe7b0', evening)} />
            ))}
          </Fade>
        )}
      </AnimatePresence>

      {/* Evening light: warm glows composited over the dusk scene */}
      <g opacity={evening} pointerEvents="none">
        <HouseGlow ctx={ctx} W={W} houseY0={houseY0} doorY0={doorY0} doorY1={doorY1} />
        {wallLights.map(([y, z], i) => {
          const [x0, y0] = P(0.04, y, z)
          return (
            <g key={`wl${i}`}>
              <ellipse cx={x0} cy={y0 - 10} rx={16} ry={34} fill={`url(#${uid}-glow)`} opacity={0.75} />
              <ellipse cx={x0} cy={y0 + 18} rx={14} ry={30} fill={`url(#${uid}-glow)`} opacity={0.55} />
            </g>
          )
        })}
        {bollards.map(([x, y], i) => {
          const [hx, hy] = P(x, y, 0.5)
          return (
            <g key={`bg${i}`}>
              <GroundEllipse ctx={ctx} x={x} y={y} r={0.95} fill={`url(#${uid}-glow)`} opacity={0.6} />
              <circle cx={hx} cy={hy} r={9} fill={`url(#${uid}-glow)`} />
            </g>
          )
        })}
        {uplights.map(([x, y, h], i) => {
          const [bx, by] = P(x, y, 0)
          const top = by - h * S
          return (
            <g key={`up${i}`}>
              <GroundEllipse ctx={ctx} x={x} y={y} r={0.7} fill={`url(#${uid}-glow)`} opacity={0.7} />
              <path d={`M${bx - 4},${by} L${bx + 4},${by} L${bx + 30},${top} L${bx - 30},${top} Z`} fill={`url(#${uid}-beam)`} />
            </g>
          )
        })}
        {lights === 'premium' &&
          festoonBulbs.map((b) => (
            <g key={`fb${b.key}`}>
              <circle cx={b.x} cy={b.y + 2.5} r={9} fill={`url(#${uid}-glow)`} opacity={0.65} />
              <circle cx={b.x} cy={b.y + 2.5} r={2.4} fill="#fff4d6" />
            </g>
          ))}
        {lights !== 'none' && has('steps') && (
          <StepGlow ctx={ctx} y0={stepsY0} y1={stepsY1} base={stepsBase} />
        )}
        {has('seating') && (
          <g className="flicker">
            {(() => {
              const [fx, fy] = P(seatX + seatR * 0.42, seatY + seatR * 0.32, 0.55)
              return <circle cx={fx} cy={fy} r={34} fill={`url(#${uid}-fire)`} />
            })()}
          </g>
        )}
      </g>

      <Dimensions ctx={ctx} L={L} W={W} evening={evening} />
    </svg>
  )
}

// ---- animated wrappers -----------------------------------------------------

function Rise({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.88, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay } }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
    >
      {children}
    </motion.g>
  )
}

function Fade({ children }: { children: ReactNode }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.6 } }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
      {children}
    </motion.g>
  )
}

// ---- scene parts ---------------------------------------------------------

function Slab({ ctx, L, W }: { ctx: Ctx; L: number; W: number }) {
  const { P, c } = ctx
  const bands: [number, number, string][] = [
    [0, -0.08, COL.lawnEdge],
    [-0.08, -0.3, COL.topsoil],
    [-0.3, -0.48, COL.subsoil],
    [-0.48, -T, COL.base],
  ]
  const stripes: ReactNode[] = []
  for (let x = 0, i = 0; x < L; x += 1.1, i++) {
    stripes.push(<polygon key={i} points={pts(P, [[x, 0, 0], [Math.min(L, x + 0.55), 0, 0], [Math.min(L, x + 0.55), W, 0], [x, W, 0]])} fill={c(COL.lawnStripe)} opacity={0.42} />)
  }
  return (
    <g>
      {bands.map(([z0, z1, col], i) => (
        <g key={i}>
          <polygon points={pts(P, [[0, W, z0], [L, W, z0], [L, W, z1], [0, W, z1]])} fill={c(shade(col, 0.2))} />
          <polygon points={pts(P, [[L, 0, z0], [L, W, z0], [L, W, z1], [L, 0, z1]])} fill={c(shade(col, 0.06))} />
        </g>
      ))}
      <polygon points={pts(P, [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0]])} fill={c(COL.lawn)} />
      {stripes}
    </g>
  )
}

function House({ ctx, W, houseY0, doorY0, doorY1, wallLights }: { ctx: Ctx; W: number; houseY0: number; doorY0: number; doorY1: number; wallLights: [number, number][] }) {
  const { P, c, uid } = ctx
  const xb = -1.9
  const wall = faces(c, COL.wall)
  const winY0 = houseY0 + 0.45
  const winY1 = doorY0 - 0.5
  const panes = 3
  return (
    <g>
      {/* gable end, cut through like an architectural model */}
      <polygon points={pts(P, [[xb, W, -T], [0, W, -T], [0, W, 0], [xb, W, 0]])} fill={c(shade(COL.foundation, 0.2))} />
      <polygon points={pts(P, [[xb, W, 0], [0, W, 0], [0, W, HOUSE_H], [xb, W, HOUSE_H]])} fill={wall.left} />
      {/* facade */}
      <polygon points={pts(P, [[0, houseY0, 0], [0, W, 0], [0, W, HOUSE_H], [0, houseY0, HOUSE_H]])} fill={wall.right} />
      <polygon points={pts(P, [[0, houseY0, 0], [0, W, 0], [0, W, FLOOR], [0, houseY0, FLOOR]])} fill={c(shade(COL.plinth, 0.09))} />
      {/* flat roof with a slim parapet */}
      <polygon points={pts(P, [[xb, houseY0, HOUSE_H], [0, houseY0, HOUSE_H], [0, W, HOUSE_H], [xb, W, HOUSE_H]])} fill={c('#d3cdc1')} />
      <polygon points={pts(P, [[xb + 0.1, houseY0 + 0.1, HOUSE_H], [-0.1, houseY0 + 0.1, HOUSE_H], [-0.1, W - 0.1, HOUSE_H], [xb + 0.1, W - 0.1, HOUSE_H]])} fill={c('#c4beb2')} />
      <polygon points={pts(P, [[0, houseY0, HOUSE_H - 0.12], [0, W, HOUSE_H - 0.12], [0, W, HOUSE_H], [0, houseY0, HOUSE_H]])} fill={c('#4a4843')} />
      <polygon points={pts(P, [[xb, W, HOUSE_H - 0.12], [0, W, HOUSE_H - 0.12], [0, W, HOUSE_H], [xb, W, HOUSE_H]])} fill={c('#3a3935')} />
      {/* a window on the gable end */}
      <polygon points={pts(P, [[xb + 0.55, W + 0.01, 1.35], [xb + 1.35, W + 0.01, 1.35], [xb + 1.35, W + 0.01, 2.5], [xb + 0.55, W + 0.01, 2.5]])} fill={c(COL.frame)} />
      <polygon points={pts(P, [[xb + 0.61, W + 0.02, 1.41], [xb + 1.29, W + 0.02, 1.41], [xb + 1.29, W + 0.02, 2.44], [xb + 0.61, W + 0.02, 2.44]])} fill={`url(#${uid}-glass)`} />

      {/* glazed doors */}
      <polygon points={pts(P, [[0.01, doorY0 - 0.08, FLOOR], [0.01, doorY1 + 0.08, FLOOR], [0.01, doorY1 + 0.08, 2.62], [0.01, doorY0 - 0.08, 2.62]])} fill={c(COL.frame)} />
      {Array.from({ length: panes }, (_, i) => {
        const a = doorY0 + ((doorY1 - doorY0) / panes) * i + 0.05
        const b = doorY0 + ((doorY1 - doorY0) / panes) * (i + 1) - 0.05
        return <polygon key={i} points={pts(P, [[0.02, a, FLOOR + 0.06], [0.02, b, FLOOR + 0.06], [0.02, b, 2.54], [0.02, a, 2.54]])} fill={`url(#${uid}-glass)`} />
      })}
      <polygon
        points={pts(P, [[0.03, doorY0 + 0.25, 2.5], [0.03, doorY0 + 0.75, 2.5], [0.03, doorY0 + 0.25, 1.2]])}
        fill="#ffffff"
        opacity={0.08}
      />
      {/* window */}
      {winY1 - winY0 > 0.6 && (
        <g>
          <polygon points={pts(P, [[0.01, winY0 - 0.06, 1.24], [0.01, winY1 + 0.06, 1.24], [0.01, winY1 + 0.06, 2.62], [0.01, winY0 - 0.06, 2.62]])} fill={c(COL.frame)} />
          <polygon points={pts(P, [[0.02, winY0, 1.3], [0.02, winY1, 1.3], [0.02, winY1, 2.55], [0.02, winY0, 2.55]])} fill={`url(#${uid}-glass)`} />
        </g>
      )}
      {/* canopy */}
      <Box ctx={ctx} x0={0} x1={0.72} y0={doorY0 - 0.25} y1={doorY1 + 0.25} z0={2.74} z1={2.84} col={faces(c, COL.coping)} />
      {/* wall lights */}
      {wallLights.map(([y, z], i) => (
        <Box key={i} ctx={ctx} x0={0} x1={0.07} y0={y - 0.06} y1={y + 0.06} z0={z - 0.12} z1={z + 0.12} col={faces(c, COL.charcoal)} />
      ))}
    </g>
  )
}

function HouseGlow({ ctx, W, houseY0, doorY0, doorY1 }: { ctx: Ctx; W: number; houseY0: number; doorY0: number; doorY1: number }) {
  const { P, uid } = ctx
  const winY0 = houseY0 + 0.45
  const winY1 = doorY0 - 0.5
  return (
    <g>
      <polygon points={pts(P, [[0.03, doorY0, FLOOR + 0.06], [0.03, doorY1, FLOOR + 0.06], [0.03, doorY1, 2.54], [0.03, doorY0, 2.54]])} fill={`url(#${uid}-warm)`} opacity={0.82} />
      {winY1 - winY0 > 0.6 && (
        <polygon points={pts(P, [[0.03, winY0, 1.3], [0.03, winY1, 1.3], [0.03, winY1, 2.55], [0.03, winY0, 2.55]])} fill={`url(#${uid}-warm)`} opacity={0.7} />
      )}
      <polygon points={pts(P, [[-1.29, W + 0.03, 1.41], [-0.61, W + 0.03, 1.41], [-0.61, W + 0.03, 2.44], [-1.29, W + 0.03, 2.44]])} fill={`url(#${uid}-warm)`} opacity={0.6} />
      {(() => {
        const [x, y] = P(1.1, (doorY0 + doorY1) / 2, 0)
        return <ellipse cx={x} cy={y} rx={90} ry={40} fill={`url(#${uid}-glow)`} opacity={0.4} />
      })()}
    </g>
  )
}

function FenceRun({ ctx, along, from, to, premium }: { ctx: Ctx; along: 'x' | 'y'; from: number; to: number; premium: boolean }) {
  const { P, c } = ctx
  // World point on this run at distance d and height z.
  const at = (d: number, z: number, out = 0): [number, number, number] => (along === 'x' ? [d, out, z] : [out, d, z])
  const faceShade = along === 'x' ? 0.24 : 0.09
  const panel = (z0: number, z1: number, col: string, a = from, b = to) => (
    <polygon points={pts(P, [at(a, z0), at(b, z0), at(b, z1), at(a, z1)])} fill={c(shade(col, faceShade))} />
  )
  const posts: ReactNode[] = []
  const postCol = premium ? COL.charcoal : COL.timberDark
  for (let d = from, i = 0; d <= to + 0.01; d += 1.8, i++) {
    const p = Math.min(d, to)
    posts.push(
      along === 'x' ? (
        <Box key={i} ctx={ctx} x0={p - 0.05} x1={p + 0.05} y0={0} y1={0.08} z0={0} z1={FENCE_H + 0.06} col={faces(c, postCol)} />
      ) : (
        <Box key={i} ctx={ctx} x0={0} x1={0.08} y0={p - 0.05} y1={p + 0.05} z0={0} z1={FENCE_H + 0.06} col={faces(c, postCol)} />
      ),
    )
  }

  if (premium) {
    const slats: ReactNode[] = []
    for (let k = 0; k < 11; k++) {
      const z0 = 0.05 + k * 0.158
      slats.push(<g key={k}>{panel(z0, z0 + 0.128, COL.slat)}</g>)
    }
    return (
      <g>
        {panel(0, FENCE_H, COL.slatGap)}
        {slats}
        {posts}
      </g>
    )
  }

  const boards: ReactNode[] = []
  for (let d = from + 0.15; d < to; d += 0.15) {
    const [x1, y1] = P(...at(d, 0.16))
    const [x2, y2] = P(...at(d, FENCE_H - 0.02))
    boards.push(<line key={d.toFixed(2)} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c(shade(COL.timber, 0.42))} strokeWidth={0.7} opacity={0.45} />)
  }
  return (
    <g>
      {panel(0, FENCE_H, COL.timber)}
      {panel(0, 0.15, COL.timberDark)}
      {boards}
      {along === 'x' ? (
        <Box ctx={ctx} x0={from} x1={to} y0={0} y1={0.09} z0={FENCE_H} z1={FENCE_H + 0.05} col={faces(c, COL.timberDark)} />
      ) : (
        <Box ctx={ctx} x0={0} x1={0.09} y0={from} y1={to} z0={FENCE_H} z1={FENCE_H + 0.05} col={faces(c, COL.timberDark)} />
      )}
      {posts}
    </g>
  )
}

function Gate({ ctx, y0, y1, premium }: { ctx: Ctx; y0: number; y1: number; premium: boolean }) {
  const { P, c } = ctx
  const x = 0.1
  const face = (a: number, b: number, z0: number, z1: number, col: string, dx = 0) => (
    <polygon points={pts(P, [[x + dx, a, z0], [x + dx, b, z0], [x + dx, b, z1], [x + dx, a, z1]])} fill={c(shade(col, 0.06))} />
  )
  const postCol = premium ? COL.charcoal : COL.timberDark
  const posts = (
    <>
      <Box ctx={ctx} x0={0} x1={0.16} y0={y0 - 0.08} y1={y0} z0={0} z1={FENCE_H + 0.12} col={faces(c, postCol)} />
      <Box ctx={ctx} x0={0} x1={0.16} y0={y1} y1={y1 + 0.08} z0={0} z1={FENCE_H + 0.12} col={faces(c, postCol)} />
    </>
  )
  if (premium) {
    const slats: ReactNode[] = []
    for (let k = 0; k < 10; k++) {
      const z0 = 0.16 + k * 0.155
      slats.push(<g key={k}>{face(y0 + 0.07, y1 - 0.07, z0, z0 + 0.12, COL.slat, 0.005)}</g>)
    }
    return (
      <g>
        {face(y0, y1, 0.06, FENCE_H, COL.charcoal)}
        {face(y0 + 0.07, y1 - 0.07, 0.13, FENCE_H - 0.07, '#1d1c19', 0.003)}
        {slats}
        {face(y1 - 0.2, y1 - 0.15, 0.7, 1.35, '#c9c3b5', 0.01)}
        {posts}
      </g>
    )
  }
  const boards: ReactNode[] = []
  for (let d = y0 + 0.12; d < y1; d += 0.12) {
    const [ax, ay] = P(x + 0.004, d, 0.08)
    const [bx, by] = P(x + 0.004, d, FENCE_H - 0.04)
    boards.push(<line key={d.toFixed(2)} x1={ax} y1={ay} x2={bx} y2={by} stroke={c('#4f3a27')} strokeWidth={0.7} opacity={0.5} />)
  }
  const [b1x, b1y] = P(x + 0.006, y0 + 0.06, 0.42)
  const [b2x, b2y] = P(x + 0.006, y1 - 0.06, 1.42)
  return (
    <g>
      {face(y0, y1, 0.06, FENCE_H - 0.02, tint(COL.timber, 0.1))}
      {boards}
      {face(y0, y1, 0.36, 0.48, COL.timberDark, 0.005)}
      {face(y0, y1, 1.38, 1.5, COL.timberDark, 0.005)}
      <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} stroke={c(COL.timberDark)} strokeWidth={4} />
      {face(y1 - 0.2, y1 - 0.12, 0.98, 1.06, '#1c1b18', 0.01)}
      {posts}
    </g>
  )
}

function PatioSurface({ ctx, paving, x1, y0, y1, z }: { ctx: Ctx; paving: Selections['paving']; x1: number; y0: number; y1: number; z: number }) {
  const { P, c } = ctx
  const p = PAVING[paving]
  const top = <polygon points={pts(P, [[0, y0, z], [x1, y0, z], [x1, y1, z], [0, y1, z]])} fill={c(paving === 'naturalStone' ? p.joint : p.top)} />

  if (paving === 'naturalStone') {
    const slabs: ReactNode[] = []
    let row = 0
    for (let x = 0; x < x1 - 0.05; row++) {
      const depth = row % 2 ? 0.45 : 0.6
      const xa = x + 0.022
      const xb = Math.min(x + depth, x1) - 0.022
      let y = y0
      let k = 0
      while (y < y1 - 0.05) {
        const len = 0.5 + rand(row * 17 + k, 5) * 0.55
        const ya = y + 0.022
        const yb = Math.min(y + len, y1) - 0.022
        if (xb > xa && yb > ya) {
          slabs.push(<polygon key={`${row}-${k}`} points={pts(P, [[xa, ya, z], [xb, ya, z], [xb, yb, z], [xa, yb, z]])} fill={c(STONE_TONES[Math.floor(rand(row * 31 + k, 8) * STONE_TONES.length)])} />)
        }
        y += len
        k++
      }
      x += depth
    }
    return (
      <g>
        {top}
        {slabs}
      </g>
    )
  }

  const step = paving === 'porcelain' ? { x: 0.6, y: 1.2 } : { x: 0.6, y: 0.6 }
  const lines: ReactNode[] = []
  for (let x = step.x; x < x1 - 0.02; x += step.x) {
    const [ax, ay] = P(x, y0, z)
    const [bx, by] = P(x, y1, z)
    lines.push(<line key={`x${x.toFixed(2)}`} x1={ax} y1={ay} x2={bx} y2={by} />)
  }
  for (let y = y0 + step.y; y < y1 - 0.02; y += step.y) {
    const [ax, ay] = P(0, y, z)
    const [bx, by] = P(x1, y, z)
    lines.push(<line key={`y${y.toFixed(2)}`} x1={ax} y1={ay} x2={bx} y2={by} />)
  }
  return (
    <g>
      {top}
      {paving === 'porcelain' && (
        <polygon points={pts(P, [[0, y0 + (y1 - y0) * 0.35, z], [x1 * 0.6, y0, z], [x1, y0, z], [0, y0 + (y1 - y0) * 0.75, z]])} fill="#ffffff" opacity={0.1} />
      )}
      <g stroke={c(p.joint)} strokeWidth={paving === 'porcelain' ? 0.6 : 0.9}>
        {lines}
      </g>
    </g>
  )
}

function PatioBorder({ ctx, x1, y0, y1, z }: { ctx: Ctx; x1: number; y0: number; y1: number; z: number }) {
  const b = 0.22
  const fill = ctx.c('#5e5a52')
  return (
    <g>
      <Flat ctx={ctx} points={[[x1 - b, y0], [x1, y0], [x1, y1], [x1 - b, y1]]} z={z + 0.002} fill={fill} />
      <Flat ctx={ctx} points={[[0, y1 - b], [x1, y1 - b], [x1, y1], [0, y1]]} z={z + 0.002} fill={fill} />
      <Flat ctx={ctx} points={[[0, y0], [x1, y0], [x1, y0 + b], [0, y0 + b]]} z={z + 0.002} fill={fill} />
    </g>
  )
}

function SeatingPad({ ctx, x, y, r }: { ctx: Ctx; x: number; y: number; r: number }) {
  const dots: ReactNode[] = []
  for (let i = 0; i < 46; i++) {
    const a = rand(i, 23) * Math.PI * 2
    const d = Math.sqrt(rand(i, 29)) * r * 0.92
    const [dx, dy] = ctx.P(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.012)
    dots.push(<circle key={i} cx={dx} cy={dy} r={1.1} fill={ctx.c(COL.gravelDot)} />)
  }
  return (
    <g>
      <GroundEllipse ctx={ctx} x={x} y={y} r={r} z={0.01} fill={ctx.c(COL.gravel)} stroke={ctx.c('#7b7264')} strokeWidth={1.4} />
      {dots}
    </g>
  )
}

function SeatingSet({ ctx, x, y, r }: { ctx: Ctx; x: number; y: number; r: number }) {
  const { P, c } = ctx
  const sx0 = x - r * 0.62
  const sx1 = x + r * 0.62
  const sy0 = y - r * 0.74
  const frame = faces(c, COL.charcoal)
  const cushion = faces(c, COL.cushion)
  const [tx, ty] = P(x - 0.15, y + 0.2, 0)
  const [tTopX, tTopY] = P(x - 0.15, y + 0.2, 0.4)
  const tr = 0.32
  const [fx, fy] = P(x + r * 0.42, y + r * 0.32, 0.42)
  const fr = 0.36
  return (
    <g>
      <Shadow ctx={ctx} x={x} y={sy0 + 0.3} r={r * 0.7} opacity={0.16} />
      <Box ctx={ctx} x0={sx0} x1={sx1} y0={sy0} y1={sy0 + 0.66} z0={0} z1={0.34} col={frame} />
      <Box ctx={ctx} x0={sx0 + 0.04} x1={sx1 - 0.04} y0={sy0 + 0.18} y1={sy0 + 0.62} z0={0.34} z1={0.44} col={cushion} />
      <Box ctx={ctx} x0={sx0} x1={sx1} y0={sy0} y1={sy0 + 0.18} z0={0.34} z1={0.8} col={frame} />
      <Box ctx={ctx} x0={sx0 + 0.06} x1={sx1 - 0.06} y0={sy0 + 0.18} y1={sy0 + 0.3} z0={0.44} z1={0.74} col={cushion} />
      {/* table */}
      <path
        d={`M${tx - tr * GROUND_RX * S},${tTopY} L${tx - tr * GROUND_RX * S},${ty} A${tr * GROUND_RX * S} ${tr * GROUND_RY * S} 0 0 0 ${tx + tr * GROUND_RX * S},${ty} L${tx + tr * GROUND_RX * S},${tTopY} Z`}
        fill={c('#2f2e2a')}
      />
      <ellipse cx={tTopX} cy={tTopY} rx={tr * GROUND_RX * S} ry={tr * GROUND_RY * S} fill={c('#55534c')} />
      {/* fire bowl */}
      <path d={`M${fx - fr * GROUND_RX * S},${fy} A${fr * GROUND_RX * S} ${fr * GROUND_RY * S * 2.1} 0 0 0 ${fx + fr * GROUND_RX * S},${fy} Z`} fill={c(COL.corten)} />
      <ellipse cx={fx} cy={fy} rx={fr * GROUND_RX * S} ry={fr * GROUND_RY * S} fill={c('#2a2420')} stroke={c(tint(COL.corten, 0.15))} strokeWidth={1.5} />
    </g>
  )
}

function RaisedBed({ ctx, x0, y0, seed }: { ctx: Ctx; x0: number; y0: number; seed: number }) {
  const { P, c } = ctx
  const x1 = x0 + 1.3
  const y1 = y0 + 0.75
  const h = 0.45
  const tufts: ReactNode[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      const [tx, ty] = P(x0 + 0.22 + i * 0.29, y0 + 0.22 + j * 0.32, h + 0.08)
      const r = 5.5 + rand(seed * 10 + i * 2 + j, 31) * 2.5
      tufts.push(
        <g key={`${i}-${j}`}>
          <circle cx={tx} cy={ty} r={r} fill={c(COL.veg)} />
          <circle cx={tx + 1.5} cy={ty - 2} r={r * 0.45} fill={c(tint(COL.veg, 0.3))} />
        </g>,
      )
    }
  }
  return (
    <g>
      <Shadow ctx={ctx} x={(x0 + x1) / 2} y={y0 + 0.4} r={0.75} opacity={0.18} />
      <Box ctx={ctx} x0={x0} x1={x1} y0={y0} y1={y1} z0={0} z1={h} col={faces(c, COL.bedTimber, 0.12)} />
      <polygon points={pts(P, [[x0 + 0.07, y0 + 0.07, h], [x1 - 0.07, y0 + 0.07, h], [x1 - 0.07, y1 - 0.07, h], [x0 + 0.07, y1 - 0.07, h]])} fill={c(COL.soil)} />
      {tufts}
    </g>
  )
}

function Steps({ ctx, y0, y1, base, colour }: { ctx: Ctx; y0: number; y1: number; base: number; colour: string }) {
  const { P, c } = ctx
  const n = 3
  const t = 0.34
  const h = (FLOOR - base) / n
  const col = faces(c, colour)
  const parts: ReactNode[] = []
  for (let k = 0; k < n; k++) {
    const zTop = base + (n - k) * h
    const xa = k * t
    const xb = (k + 1) * t
    parts.push(<polygon key={`t${k}`} points={pts(P, [[xa, y0, zTop], [xb, y0, zTop], [xb, y1, zTop], [xa, y1, zTop]])} fill={col.top} />)
    parts.push(<polygon key={`r${k}`} points={pts(P, [[xb, y0, zTop - h], [xb, y1, zTop - h], [xb, y1, zTop], [xb, y0, zTop]])} fill={col.right} />)
  }
  const profile: [number, number, number][] = [[0, y1, base], [n * t, y1, base]]
  for (let k = n - 1; k >= 0; k--) {
    profile.push([(k + 1) * t, y1, base + (n - k) * h], [k * t, y1, base + (n - k) * h])
  }
  return (
    <g>
      {parts}
      <polygon points={pts(P, profile)} fill={col.left} />
    </g>
  )
}

function StepGlow({ ctx, y0, y1, base }: { ctx: Ctx; y0: number; y1: number; base: number }) {
  const h = (FLOOR - base) / 3
  return (
    <g>
      {[0, 1, 2].map((k) => {
        const [x, y] = ctx.P((k + 1) * 0.34 + 0.02, (y0 + y1) / 2, base + (2 - k) * h + h * 0.5)
        return <ellipse key={k} cx={x} cy={y} rx={22} ry={7} fill={`url(#${ctx.uid}-glow)`} opacity={0.8} />
      })}
    </g>
  )
}

function Dimensions({ ctx, L, W, evening }: { ctx: Ctx; L: number; W: number; evening: number }) {
  const { P } = ctx
  const ink = mix('#8a8374', '#b9b2a2', evening)
  const off = 0.85
  const tick = 0.18
  const [a1x, a1y] = P(0, W + off, -T)
  const [a2x, a2y] = P(L, W + off, -T)
  const [b1x, b1y] = P(L + off, 0, -T)
  const [b2x, b2y] = P(L + off, W, -T)
  const [la, lb] = P(L / 2, W + off + 0.42, -T)
  const [ma, mb] = P(L + off + 0.42, W / 2, -T)
  const tickLine = (x: number, y: number, dx: number, dy: number, key: string) => {
    const [p1x, p1y] = P(x - dx, y - dy, -T)
    const [p2x, p2y] = P(x + dx, y + dy, -T)
    return <line key={key} x1={p1x} y1={p1y} x2={p2x} y2={p2y} />
  }
  return (
    <g className="scene__dims" stroke={ink} fill={ink} strokeWidth={1}>
      <line x1={a1x} y1={a1y} x2={a2x} y2={a2y} />
      <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} />
      {tickLine(0, W + off, 0, tick, 'a')}
      {tickLine(L, W + off, 0, tick, 'b')}
      {tickLine(L + off, 0, tick, 0, 'c')}
      {tickLine(L + off, W, tick, 0, 'd')}
      <text x={la} y={lb} transform={`rotate(30 ${la} ${lb})`} textAnchor="middle" dominantBaseline="middle" stroke="none">
        ≈ {Math.round(L)} m
      </text>
      <text x={ma} y={mb} transform={`rotate(-30 ${ma} ${mb})`} textAnchor="middle" dominantBaseline="middle" stroke="none">
        ≈ {Math.round(W)} m
      </text>
    </g>
  )
}
