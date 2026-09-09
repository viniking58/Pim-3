import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import './preloader.css'

const PHASES = ['Ligando a ignição', 'Aquecendo o motor', 'Liberando a pista']

export function Preloader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (reduced) {
      setProgress(100)
      setOpen(false)
      onDone()
      return
    }

    document.body.style.overflow = 'hidden'
    let current = 0
    const tick = window.setInterval(() => {
      // Avança em passos irregulares para parecer carregamento real.
      current = Math.min(100, current + Math.random() * 13 + 5)
      setProgress(current)
      if (current >= 100) {
        window.clearInterval(tick)
        window.setTimeout(() => setOpen(false), 420)
        window.setTimeout(() => {
          document.body.style.overflow = ''
          onDone()
        }, 1180)
      }
    }, 130)

    return () => {
      window.clearInterval(tick)
      document.body.style.overflow = ''
    }
  }, [onDone, reduced])

  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor(progress / 34))]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="preloader"
          exit={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          aria-hidden="true"
        >
          <div className="preloader__panels">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.span
                key={index}
                className="preloader__panel"
                initial={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.06,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            ))}
          </div>

          <motion.div
            className="preloader__content"
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="preloader__mark">
              <svg viewBox="0 0 120 60" role="presentation">
                <motion.path
                  d="M14 50V10h26c11 0 18 6.6 18 16.4S51 43 40 43H26v7z"
                  fill="none"
                  stroke="var(--brand-red)"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M76 10h8v40h-8z"
                  fill="none"
                  stroke="var(--ink-000)"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                />
              </svg>
            </div>

            <div className="preloader__meta">
              <span className="preloader__phase">{phase}</span>
              <span className="preloader__count">{String(Math.floor(progress)).padStart(3, '0')}</span>
            </div>

            <div className="preloader__bar">
              <motion.span
                className="preloader__fill"
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
