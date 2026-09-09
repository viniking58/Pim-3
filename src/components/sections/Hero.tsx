import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { MagneticButton } from '../motion/MagneticButton'
import { Vehicle } from '../../graphics/Vehicle'
import './hero.css'

const HEADLINE = ['Adrenalina', 'com selo', 'BRP']

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Camadas se afastam em velocidades diferentes: paralaxe de profundidade.
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '38%'])
  const vehicleY = useTransform(scrollYProgress, [0, 1], ['0%', '-26%'])
  const vehicleScale = useTransform(scrollYProgress, [0, 1], [1, 1.16])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '52%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

  const smoothVehicleY = useSpring(vehicleY, { stiffness: 120, damping: 24 })

  return (
    <section className="hero" id="topo" ref={ref}>
      <motion.div className="hero__grid" style={reduced ? undefined : { y: gridY }} aria-hidden="true" />
      <motion.div className="hero__glow" style={reduced ? undefined : { y: glowY }} aria-hidden="true" />

      {/* Riscos de velocidade cruzando o fundo */}
      <div className="hero__streaks" aria-hidden="true">
        {[12, 34, 58, 76, 88].map((top, index) => (
          <motion.span
            key={top}
            style={{ top: `${top}%` }}
            initial={{ x: '-30%', opacity: 0 }}
            animate={reduced ? {} : { x: ['-30%', '130%'], opacity: [0, 0.55, 0] }}
            transition={{
              duration: 3.4 + index * 0.5,
              repeat: Infinity,
              delay: index * 0.9,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="hero__inner shell">
        <motion.div className="hero__copy" style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Concessionária autorizada BRP · Vale do Paraíba
          </motion.span>

          <h1 className="hero__title">
            {HEADLINE.map((line, lineIndex) => (
              <span className="hero__line" key={line}>
                <motion.span
                  className="hero__line-inner"
                  initial={{ y: '115%', rotate: 5 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{
                    duration: 1.15,
                    delay: 0.25 + lineIndex * 0.11,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line === 'BRP' ? <span className="accent">{line}</span> : line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="lead hero__lead"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Sea-Doo, Can-Am e Switch em 800 m² de showroom no Jardim Aquarius. Vendas, peças
            genuínas e oficina com técnicos treinados de fábrica.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton href="#linha" variant="solid" cursorLabel="Ver">
              Ver a linha completa
            </MagneticButton>
            <MagneticButton href="#contato" variant="ghost" cursorLabel="Agendar">
              Agendar visita
            </MagneticButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__stage"
          style={reduced ? undefined : { y: smoothVehicleY, scale: vehicleScale }}
          initial={{ opacity: 0, x: 90, rotate: -4 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero__stage-ring" aria-hidden="true" />
          <Vehicle type="jetski" accent="var(--brand-seadoo)" title="Jet ski Sea-Doo em movimento" />
          <motion.span
            className="hero__stage-tag"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.25, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            Rotax 1630 ACE · até 325 hp
          </motion.span>
        </motion.div>
      </div>

      <div className="hero__foot shell">
        <div className="hero__foot-item">
          <span className="hero__foot-key">Endereço</span>
          <span>Av. Eng. Florestan Fernandes, 520 — SJC</span>
        </div>
        <div className="hero__foot-item">
          <span className="hero__foot-key">Horário</span>
          <span>Seg. a sex., 9h às 19h</span>
        </div>
        <a className="hero__scroll" href="#linha" aria-label="Rolar para a linha de produtos">
          <span>Role</span>
          <motion.span
            className="hero__scroll-line"
            animate={reduced ? {} : { scaleY: [0, 1, 0], transformOrigin: ['top', 'top', 'bottom'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </a>
      </div>
    </section>
  )
}
