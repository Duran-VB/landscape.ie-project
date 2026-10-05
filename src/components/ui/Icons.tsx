import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

export const ArrowDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v15M6 13l6 6 6-6" />
  </svg>
)

export const ArrowUp = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 20V5M6 11l6-6 6 6" />
  </svg>
)

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const Plus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Check = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const Phone = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6.6 3.5h2.6l1.4 4.1-2 1.3a12 12 0 0 0 6.5 6.5l1.3-2 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  </svg>
)

export const Sun = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" />
  </svg>
)

export const Moon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1Z" />
  </svg>
)

export const Upload = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
)

export const Drag = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
  </svg>
)

export const Star = ({ amount = 1, ...p }: IconProps & { amount?: number }) => {
  const id = `star-${Math.round(amount * 100)}`
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...p}>
      <defs>
        <linearGradient id={id}>
          <stop offset={amount} stopColor="currentColor" />
          <stop offset={amount} stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="m12 2.6 2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7L12 2.6Z"
      />
    </svg>
  )
}

export function Stars({ rating = 5, className }: { rating?: number; className?: string }) {
  return (
    <span className={className} style={{ display: 'inline-flex', gap: 3 }} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} width="1em" height="1em" amount={Math.max(0, Math.min(1, rating - i))} />
      ))}
    </span>
  )
}
