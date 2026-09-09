import { motion, useScroll, useSpring } from 'motion/react'
import './scroll-progress.css'

/** Barra fina no topo indicando o progresso de leitura da página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
