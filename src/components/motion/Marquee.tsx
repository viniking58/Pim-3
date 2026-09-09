import { useRef, type ReactNode } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'motion/react'
import './marquee.css'

type MarqueeProps = {
  children: ReactNode
  /** Velocidade base em % da faixa por segundo. */
  speed?: number
  /** -1 corre para a direita, 1 para a esquerda. */
  direction?: 1 | -1
  className?: string
  /** Quando true, a velocidade do scroll acelera e inverte a faixa. */
  scrollReactive?: boolean
}

/**
 * Faixa infinita cuja velocidade responde ao scroll: rolar rápido para baixo
 * acelera o texto, rolar para cima o joga na direção contrária.
 */
export function Marquee({
  children,
  speed = 6,
  direction = -1,
  className,
  scrollReactive = true,
}: MarqueeProps) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 380 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], { clamp: false })

  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`)
  const directionRef = useRef(direction)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    let moveBy = directionRef.current * speed * (delta / 1000)

    if (scrollReactive) {
      const factor = velocityFactor.get()
      if (factor < 0) directionRef.current = direction === 1 ? -1 : 1
      else if (factor > 0) directionRef.current = direction
      moveBy += directionRef.current * moveBy * Math.abs(factor)
    }

    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className={`marquee${className ? ` ${className}` : ''}`} aria-hidden="true">
      <motion.div className="marquee__track" style={{ x }}>
        {[0, 1, 2, 3].map((index) => (
          <div className="marquee__group" key={index}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/** Mantém `value` dentro do intervalo [min, max) de forma cíclica. */
function wrap(min: number, max: number, value: number) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}
