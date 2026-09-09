import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { ScrollWords } from '../motion/ScrollWords'
import { Reveal } from '../motion/Reveal'
import { PROCESS } from '../../data/site'
import './manifesto.css'

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const wordmarkX = useTransform(scrollYProgress, [0, 1], ['12%', '-18%'])

  return (
    <section className="section manifesto" ref={ref}>
      <motion.span
        className="manifesto__wordmark"
        style={reduced ? undefined : { x: wordmarkX }}
        aria-hidden="true"
      >
        P1 · BRP · P1 · BRP
      </motion.span>

      <div className="shell manifesto__inner">
        <Reveal>
          <span className="eyebrow">Por que a P1</span>
        </Reveal>

        <ScrollWords
          className="manifesto__statement"
          text="Ser a primeira concessionária BRP do Vale do Paraíba não é sobre chegar antes. É sobre entregar o veículo certo, preparado pela nossa oficina, para quem vai usar de verdade — no lago, na trilha e na estrada."
        />

        <div className="manifesto__process">
          {PROCESS.map((item, index) => (
            <Reveal as="article" className="manifesto__step" key={item.step} delay={index * 0.08}>
              <span className="manifesto__step-num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="manifesto__step-line" aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
