import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import './cursor.css'

/**
 * Cursor customizado com anel elástico. Cresce e mostra rótulo em elementos
 * marcados com `data-cursor="…"`. Desativado em toque e em reduced motion.
 */
export function Cursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 180, damping: 20, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 180, damping: 20, mass: 0.5 })

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setEnabled(true)

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      if (target) {
        setLabel(target.dataset.cursor || '')
        setActive(true)
      } else {
        const interactive = (event.target as HTMLElement | null)?.closest(
          'a, button, input, textarea, select',
        )
        setLabel(null)
        setActive(Boolean(interactive))
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden="true" />
      <motion.div
        className={`cursor-ring${active ? ' is-active' : ''}${label ? ' has-label' : ''}`}
        style={{ x: ringX, y: ringY }}
        animate={{ scale: label ? 2.5 : active ? 1.7 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        aria-hidden="true"
      >
        {label ? <span className="cursor-ring__label">{label}</span> : null}
      </motion.div>
    </>
  )
}
