import { motion } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { Reveal } from '../motion/Reveal'
import { SERVICES } from '../../data/site'
import './services.css'

export function Services() {
  return (
    <section className="section services" id="servicos">
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow">Depois da venda</span>
          </Reveal>
          <SplitText as="h2" text="A loja não termina na entrega" className="services__title" />
          <Reveal delay={0.1}>
            <p className="lead">
              Estrutura autorizada BRP para manter o seu veículo dentro do padrão de fábrica —
              da revisão programada às peças genuínas em estoque.
            </p>
          </Reveal>
        </div>

        <ul className="services__grid">
          {SERVICES.map((service, index) => (
            <motion.li
              className="services__item"
              key={service.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.75, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              data-cursor="Saiba mais"
            >
              <span className="services__num">{String(index + 1).padStart(2, '0')}</span>
              <span className="services__tag">{service.tag}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="services__glow" aria-hidden="true" />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
