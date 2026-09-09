import { useCallback } from 'react'
import { useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/**
 * Efeito "ímã": o elemento persegue levemente o ponteiro dentro dos seus
 * próprios limites e volta com mola ao sair.
 */
export function useMagnetic(strength = 0.35) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const config = { stiffness: 260, damping: 18, mass: 0.5 }
  const sx = useSpring(x, config)
  const sy = useSpring(y, config)

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (reduced) return
      const rect = event.currentTarget.getBoundingClientRect()
      x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
      y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
    },
    [reduced, strength, x, y],
  )

  const onPointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { x: sx, y: sy, handlers: { onPointerMove, onPointerLeave } }
}
