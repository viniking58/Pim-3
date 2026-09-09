import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import './route-transition.css'

/**
 * Transição entre rotas. Num site editorial claro, uma cortina pesada seria
 * ruído — o gesto é o conteúdo saindo e entrando com uma linha de progresso
 * atravessando o topo, que dá a sensação de carregamento sem esconder a
 * página inteira.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const reduced = useReducedMotion()

  // Cada rota começa do topo; sem isso a página nova herda a rolagem da anterior.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (reduced) return <>{children}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="route"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="route__sweep"
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={{ scaleX: [0, 1, 1], transformOrigin: ['left', 'left', 'right'] }}
          exit={{ scaleX: 0, transformOrigin: 'right' }}
          transition={{ duration: 0.62, times: [0, 0.55, 1], ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
