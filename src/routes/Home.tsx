import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { MagneticButton } from '../components/motion/MagneticButton'
import { Marquee } from '../components/motion/Marquee'
import { Vehicle } from '../graphics/Vehicle'
import { useCountUp } from '../hooks/useCountUp'
import { MODELS, PLATFORMS, PROCESS, CONTACT } from '../data/models'
import './page.css'
import './home.css'

const FEATURED = ['rxp-x', 'maverick-r', 'switch']

const NUMBERS = [
  { value: 800, suffix: ' m²', label: 'de showroom no Jardim Aquarius' },
  { value: 10, suffix: '', label: 'modelos das três linhas em piso de loja' },
  { value: 100, suffix: '%', label: 'peças genuínas com garantia de fábrica' },
]

export function Home() {
  return (
    <>
      {/* Abertura editorial: o título é a tese, e a página já mostra conteúdo
          no primeiro quadro — nada de herói ocupando a tela inteira. */}
      <section className="opener">
        <div className="shell opener__inner">
          <div className="opener__copy">
            <Reveal>
              <span className="label">Concessionária autorizada BRP · Vale do Paraíba</span>
            </Reveal>
            <SplitText as="h1" text="Água, barro e asfalto saem da mesma porta" className="opener__title" onView={false} />
            <Reveal delay={0.2}>
              <p className="lead">
                Sea-Doo, Can-Am e Switch em 800 m² no Jardim Aquarius, com oficina autorizada e
                peças genuínas no mesmo endereço. Você compra de quem pilota o que vende.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="opener__actions">
                <MagneticButton href="/modelos" variant="solid" cursorLabel="Linha">
                  Ver a linha
                </MagneticButton>
                <MagneticButton href="/montar" variant="ghost" cursorLabel="Montar">
                  Monte o seu
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="opener__art">
            <Vehicle type="jetski" accent="var(--brand-marine)" title="Moto aquática Sea-Doo" />
          </Reveal>
        </div>
      </section>

      <div className="bleed brandline">
        <Marquee speed={4}>
          {['Sea-Doo', 'Can-Am Off-Road', 'Can-Am On-Road', 'Sea-Doo Switch', 'Rotax', 'Peças genuínas'].map(
            (item) => (
              <span className="brandline__item" key={item}>
                {item}
                <i aria-hidden="true" />
              </span>
            ),
          )}
        </Marquee>
      </div>

      {/* As quatro plataformas, do jeito que a BRP organiza a linha. */}
      <section className="section">
        <div className="shell">
          <div className="sectionhead">
            <Reveal>
              <span className="label">A linha</span>
            </Reveal>
            <SplitText as="h2" text="Quatro plataformas" />
            <Reveal delay={0.1}>
              <p className="lead">
                Cada uma resolve um problema diferente. A conversa começa por onde você pilota.
              </p>
            </Reveal>
          </div>

          <ul className="platforms">
            {PLATFORMS.map((platform, index) => (
              <Reveal as="li" key={platform.id} delay={index * 0.07}>
                <Link
                  to={`/modelos?linha=${platform.id}`}
                  className="platform"
                  style={{ ['--accent' as string]: platform.accentVar }}
                >
                  <span className="platform__brand label">{platform.brand}</span>
                  <h3>{platform.name}</h3>
                  <p>{platform.tagline}</p>
                  <span className="platform__count data">
                    {MODELS.filter((model) => model.platform === platform.id).length} modelos
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Destaques em linhas editoriais de sangria, não em grade de cards. */}
      <section className="section featured">
        <div className="shell sectionhead">
          <Reveal>
            <span className="label">Em destaque</span>
          </Reveal>
          <SplitText as="h2" text="Três que valem a visita" />
        </div>

        <div className="shell">
          {FEATURED.map((slug, index) => {
            const model = MODELS.find((item) => item.slug === slug)!
            return (
              <Reveal key={slug} delay={index * 0.06}>
                <Link to={`/modelos/${model.slug}`} className="feature" data-cursor="Ver">
                  <span className="feature__index data">{String(index + 1).padStart(2, '0')}</span>
                  <div className="feature__art">
                    <motion.div layoutId={`art-${model.slug}`}>
                      <Vehicle type={model.art} accent="var(--brand-marine)" title={model.name} />
                    </motion.div>
                  </div>
                  <div className="feature__copy">
                    <h3>{model.name}</h3>
                    <p>{model.blurb}</p>
                  </div>
                  <span className="feature__power data">
                    {Math.max(...model.engines.map((engine) => engine.power))}
                    <em>hp</em>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Sequência real — por isso, e só por isso, é numerada. */}
      <section className="section on-stage bleed process">
        <div className="shell">
          <div className="sectionhead">
            <Reveal>
              <span className="label">Como a compra acontece</span>
            </Reveal>
            <SplitText as="h2" text="Quatro etapas, nesta ordem" />
          </div>

          <ol className="steps">
            {PROCESS.map((item, index) => (
              <Reveal as="li" key={item.step} delay={index * 0.08} className="step">
                <span className="step__num data">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell numbers">
          {NUMBERS.map((number) => (
            <Number key={number.label} {...number} />
          ))}
        </div>
      </section>

      <section className="shell">
        <div className="endcta">
          <div>
            <span className="label">Jardim Aquarius</span>
            <h2>Passe na loja e suba em um</h2>
          </div>
          <div className="endcta__actions">
            <MagneticButton href="/contato" variant="solid" cursorLabel="Agendar">
              Agendar visita
            </MagneticButton>
            <MagneticButton href="/concessionaria" variant="ghost">
              Conhecer a loja
            </MagneticButton>
          </div>
        </div>
        <p className="endcta__meta label">
          {CONTACT.address} · {CONTACT.hours}
        </p>
      </section>
    </>
  )
}

function Number({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const counter = useCountUp(value, 1.9)
  return (
    <Reveal className="number">
      <span className="number__value">
        <span ref={counter.ref} className="data">
          {counter.display}
        </span>
        <em>{suffix}</em>
      </span>
      <span className="number__label">{label}</span>
    </Reveal>
  )
}
