import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { Vehicle } from '../../graphics/Vehicle'
import { PRODUCTS } from '../../data/site'
import './showcase.css'

const FEATURED = ['rxp-x', 'maverick-r', 'switch', 'ryker'] as const

export function Showcase() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const panels = FEATURED.map((id) => PRODUCTS.find((product) => product.id === id)!).filter(Boolean)
  const distance = (panels.length - 1) * 100

  const rawX = useTransform(scrollYProgress, [0, 1], ['0%', `-${distance}vw`])
  const x = useSpring(rawX, { stiffness: 90, damping: 26, restDelta: 0.001 })
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  if (reduced) {
    return (
      <section className="section showcase-static" id="experiencia">
        <div className="shell">
          {panels.map((product) => (
            <article className="showcase-static__item" key={product.id}>
              <Vehicle type={product.type} accent={product.accent} animate={false} title={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p className="lead">{product.tagline}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      className="showcase"
      id="experiencia"
      ref={ref}
      style={{ height: `${panels.length * 100}vh` }}
    >
      <div className="showcase__sticky">
        <div className="showcase__header shell">
          <span className="eyebrow">Vitrine em movimento</span>
          <p className="showcase__hint">
            Continue rolando — a vitrine anda na horizontal
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M3 12h18M15 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
        </div>

        <motion.div className="showcase__track" style={{ x }}>
          {panels.map((product, index) => (
            <article className="showcase__panel" key={product.id}>
              <span className="showcase__index">{String(index + 1).padStart(2, '0')}</span>

              <div className="showcase__art" style={{ ['--accent' as string]: product.accent }}>
                <span className="showcase__art-glow" aria-hidden="true" />
                <Vehicle type={product.type} accent={product.accent} title={product.name} />
              </div>

              <div className="showcase__copy">
                <span className="showcase__family" style={{ color: product.accent }}>
                  {product.family}
                </span>
                <h3 className="showcase__name">{product.name}</h3>
                <p className="lead">{product.tagline}</p>
                <div className="showcase__stats">
                  <div>
                    <strong>
                      {product.hero.value}
                      <em>{product.hero.suffix}</em>
                    </strong>
                    <span>{product.hero.label}</span>
                  </div>
                  {product.specs.slice(0, 2).map((spec) => (
                    <div key={spec.label}>
                      <strong>{spec.value}</strong>
                      <span>{spec.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </motion.div>

        <div className="showcase__progress shell" aria-hidden="true">
          <motion.span style={{ scaleX: progressScale }} />
        </div>
      </div>
    </section>
  )
}
