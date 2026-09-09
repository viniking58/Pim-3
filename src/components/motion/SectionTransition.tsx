import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './section-transition.css'

/**
 * Cortina de vidro que passa pela tela quando o visitante clica num link de
 * navegação. Ela cobre o salto do scroll: em vez de a página "teleportar"
 * entre A linha e o Configurador, há um fade/slide costurando as duas.
 *
 * O scroll suave continua sendo do Lenis; isto só encobre o trecho do meio.
 */
export function SectionTransition() {
  const reduced = useReducedMotion()
  const [wiping, setWiping] = useState(false)

  useEffect(() => {
    if (reduced) return

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]')
      if (!(anchor instanceof HTMLAnchorElement)) return

      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return

      // Só vale a pena encobrir saltos longos; um vizinho logo abaixo fica
      // melhor com o scroll suave puro.
      const distance = Math.abs(target.getBoundingClientRect().top)
      if (distance < window.innerHeight * 0.9) return

      setWiping(true)
      window.setTimeout(() => setWiping(false), 900)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [reduced])

  return (
    <AnimatePresence>
      {wiping && (
        <motion.div
          className="section-wipe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="section-wipe__band"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{
                duration: 0.85,
                delay: index * 0.05,
                times: [0, 0.45, 1],
                ease: [0.76, 0, 0.24, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
