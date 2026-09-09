import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { Reveal } from '../motion/Reveal'
import { useCountUp } from '../../hooks/useCountUp'
import { STATS, CONTACT } from '../../data/site'
import './store.css'

export function Store() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const skyY = useTransform(scrollYProgress, [0, 1], ['-14%', '14%'])

  return (
    <section className="section store" id="loja" ref={ref}>
      <motion.div className="store__sky" style={reduced ? undefined : { y: skyY }} aria-hidden="true" />

      <div className="shell store__inner">
        <div className="store__copy">
          <Reveal>
            <span className="eyebrow">A loja</span>
          </Reveal>
          <SplitText as="h2" text="800 m² no Jardim Aquarius" className="store__title" />
          <Reveal delay={0.1}>
            <p className="lead">
              Showroom, boxes de oficina e estoque de peças no mesmo endereço. Você entra para ver
              um modelo e sai sabendo exatamente como ele se comporta — porque tem alguém aqui que
              pilota o que vende.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <address className="store__address">
              <span>{CONTACT.address}</span>
              <span>{CONTACT.city} · {CONTACT.zip}</span>
              <span>{CONTACT.hours}</span>
            </address>
          </Reveal>
        </div>

        <ul className="store__stats">
          {STATS.map((stat, index) => (
            <Reveal as="li" className="store__stat" key={stat.label} delay={index * 0.09}>
              <StatValue value={stat.value} suffix={stat.suffix} />
              <span className="store__stat-label">{stat.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const counter = useCountUp(value, 2)
  return (
    <span className="store__stat-value">
      <span ref={counter.ref}>{counter.display}</span>
      <em>{suffix}</em>
    </span>
  )
}
