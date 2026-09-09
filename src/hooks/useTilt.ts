import { useCallback, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'

type TiltOptions = {
  /** Amplitude máxima da rotação, em graus. */
  max?: number
  /** Deslocamento em Z aplicado no hover, em pixels. */
  lift?: number
}

/**
 * Inclinação 3D reativa ao ponteiro. Devolve handlers para o container e
 * motion values prontos para `style` — inclusive coordenadas normalizadas
 * (`px`/`py`, 0→1) para posicionar brilhos e reflexos.
 */
export function useTilt({ max = 10, lift = 24 }: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const hovered = useMotionValue(0)

  const config = { stiffness: 170, damping: 20, mass: 0.6 }
  const sx = useSpring(mx, config)
  const sy = useSpring(my, config)
  const sHover = useSpring(hovered, config)

  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const z = useTransform(sHover, [0, 1], [0, lift])

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return
      const rect = event.currentTarget.getBoundingClientRect()
      mx.set((event.clientX - rect.left) / rect.width)
      my.set((event.clientY - rect.top) / rect.height)
    },
    [mx, my, reduced],
  )

  const onPointerEnter = useCallback(() => {
    if (!reduced) hovered.set(1)
  }, [hovered, reduced])

  const onPointerLeave = useCallback(() => {
    hovered.set(0)
    mx.set(0.5)
    my.set(0.5)
  }, [hovered, mx, my])

  return {
    ref,
    handlers: { onPointerMove, onPointerEnter, onPointerLeave },
    rotateX,
    rotateY,
    z,
    px: sx,
    py: sy,
    hover: sHover,
  }
}
