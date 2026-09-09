import { motion, useTransform } from 'motion/react'
import { useTilt } from '../../hooks/useTilt'
import { useCountUp } from '../../hooks/useCountUp'
import { Vehicle } from '../../graphics/Vehicle'
import type { Product } from '../../data/site'
import './product-card.css'

/**
 * Card com inclinação 3D, reflexo que segue o ponteiro e o veículo
 * animado flutuando à frente do plano do card.
 */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { handlers, rotateX, rotateY, z, px, py, hover } = useTilt({ max: 9, lift: 30 })
  const counter = useCountUp(product.hero.value, 1.6)

  const glareX = useTransform(px, [0, 1], ['0%', '100%'])
  const glareY = useTransform(py, [0, 1], ['0%', '100%'])
  const glareOpacity = useTransform(hover, [0, 1], [0, 0.5])
  const vehicleX = useTransform(px, [0, 1], [-14, 14])
  const vehicleY = useTransform(py, [0, 1], [-8, 8])

  return (
    <motion.article
      className="pcard"
      style={{ '--pcard-accent': product.accent } as React.CSSProperties}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.85, delay: (index % 3) * 0.09, ease: [0.16, 1, 0.3, 1] }}
      layout
    >
      <motion.div
        className="pcard__tilt"
        style={{ rotateX, rotateY, z, transformPerspective: 1100 }}
        {...handlers}
        data-cursor="Detalhes"
      >
        <motion.span className="pcard__glare" style={{ left: glareX, top: glareY, opacity: glareOpacity }} />

        <header className="pcard__head">
          <span className="pcard__family">{product.family}</span>
          {product.badge && <span className="pcard__badge">{product.badge}</span>}
        </header>

        <motion.div className="pcard__stage" style={{ x: vehicleX, y: vehicleY }}>
          <Vehicle type={product.type} accent={product.accent} title={product.name} />
        </motion.div>

        <div className="pcard__body">
          <h3 className="pcard__name">{product.name}</h3>
          <p className="pcard__tagline">{product.tagline}</p>

          <div className="pcard__hero">
            <span className="pcard__hero-value">
              <span ref={counter.ref}>{counter.display}</span>
              <em>{product.hero.suffix}</em>
            </span>
            <span className="pcard__hero-label">{product.hero.label}</span>
          </div>

          <dl className="pcard__specs">
            {product.specs.map((spec) => (
              <div key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>

          <a className="pcard__cta" href="#contato">
            <span>Consultar condições</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M2 8h12M9 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </motion.div>
    </motion.article>
  )
}
