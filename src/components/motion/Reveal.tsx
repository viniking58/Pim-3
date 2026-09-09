import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type RevealProps = {
  children: ReactNode
  /** Atraso em segundos antes de iniciar. */
  delay?: number
  /** Distância inicial do deslocamento, em pixels. */
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article' | 'header' | 'footer'
}

/** Entrada padrão do site: fade + subida com easing expo-out. */
export function Reveal({ children, delay = 0, y = 34, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const Component = motion[as]

  return (
    <Component
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  )
}
