import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { Reveal } from '../motion/Reveal'
import { ProductCard } from './ProductCard'
import { CATEGORIES, PRODUCTS } from '../../data/site'
import './fleet.css'

type CategoryId = (typeof CATEGORIES)[number]['id']

export function Fleet() {
  const [active, setActive] = useState<CategoryId>('todos')

  const visible = useMemo(
    () => (active === 'todos' ? PRODUCTS : PRODUCTS.filter((item) => item.category === active)),
    [active],
  )

  return (
    <section className="section fleet" id="linha">
      <div className="shell">
        <div className="fleet__head">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">A linha completa</span>
            </Reveal>
            <SplitText as="h2" text="Cada máquina em movimento" className="fleet__title" />
            <Reveal delay={0.1}>
              <p className="lead">
                Toda a família BRP representada pela P1: da água ao barro, do asfalto ao lago.
                Passe o ponteiro em qualquer card — as rodas giram, o casco corta a água e o
                veículo sai do plano.
              </p>
            </Reveal>
          </div>

          <motion.div
            className="fleet__filters-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <LayoutGroup id="fleet-filters">
              <div className="fleet__filters glass" role="tablist" aria-label="Filtrar linha de produtos">
                {CATEGORIES.map((category) => {
                  const isActive = active === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`fleet__filter${isActive ? ' is-active' : ''}`}
                      onClick={() => setActive(category.id)}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="fleet-filter-pill"
                          className="fleet__filter-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="fleet__filter-label">{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>
          </motion.div>
        </div>

        <LayoutGroup id="fleet-grid">
          <motion.div className="fleet__grid" layout>
            <AnimatePresence mode="popLayout">
              {visible.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  exit={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        <Reveal delay={0.1}>
          <p className="fleet__note">
            Disponibilidade, versões e condições comerciais variam por lote.{' '}
            <a href="#contato">Fale com um consultor</a> para checar o estoque atual do showroom.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
