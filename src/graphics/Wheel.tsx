import { motion } from 'motion/react'

type WheelProps = {
  uid: string
  cx: number
  cy: number
  r: number
  accent: string
  spin: boolean
  /** Segundos por volta completa. */
  duration?: number
  /** Quantidade de tacos na banda de rodagem. */
  lugs?: number
}

/** Roda off-road com banda de rodagem e aro que giram de verdade. */
export function Wheel({ uid, cx, cy, r, accent, spin, duration = 1.1, lugs = 16 }: WheelProps) {
  const treads = Array.from({ length: lugs }, (_, index) => (index * 360) / lugs)
  const spokes = [0, 60, 120, 180, 240, 300]

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-tyre)`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="1.5" />

      <motion.g
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        animate={spin ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spin ? { duration, repeat: Infinity, ease: 'linear' } : { duration: 0.6, ease: 'easeOut' }
        }
      >
        {/* Tacos da banda de rodagem */}
        {treads.map((angle) => (
          <rect
            key={angle}
            x={cx - 3}
            y={cy - r + 1}
            width="6"
            height={r * 0.24}
            rx="2"
            fill="#050609"
            fillOpacity="0.9"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}

        {/* Aro */}
        <circle cx={cx} cy={cy} r={r * 0.62} fill="#141821" stroke="#4b5364" strokeWidth="1.2" />
        {spokes.map((angle) => (
          <rect
            key={angle}
            x={cx - 3.5}
            y={cy - r * 0.58}
            width="7"
            height={r * 0.5}
            rx="3"
            fill="#5d6678"
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.17} fill={accent} />
      </motion.g>

      <circle cx={cx} cy={cy} r={r * 0.08} fill="#0a0c11" />
    </g>
  )
}
