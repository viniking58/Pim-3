import { Suspense, lazy, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { MagneticButton } from '../components/motion/MagneticButton'
import { Vehicle } from '../graphics/Vehicle'
import { NotFound } from './NotFound'
import {
  MODELS,
  PAINTS,
  modelBySlug,
  modelsByPlatform,
  platformById,
} from '../data/models'
import type { SceneConfig } from '../three/VehicleScene'
import './page.css'
import './model-detail.css'

const VehicleScene = lazy(() =>
  import('../three/VehicleScene').then((module) => ({ default: module.VehicleScene })),
)

export function ModelDetail() {
  const { slug } = useParams()
  const model = modelBySlug(slug)
  const [engineIndex, setEngineIndex] = useState(0)

  const platform = model ? platformById(model.platform) : null

  const config: SceneConfig | null = useMemo(() => {
    if (!model) return null
    return {
      model: model.scene,
      // Branco sobre o palco escuro: preto sobre preto some.
      color: PAINTS[1].hex,
      finish: 'metallic',
      accent: '#c9d0dd',
      env: 'studio',
      moving: false,
      autoRotate: true,
    }
  }, [model])

  if (!model || !platform || !config) return <NotFound />

  const engine = model.engines[engineIndex]
  const related = modelsByPlatform(model.platform).filter((item) => item.slug !== model.slug)

  return (
    <>
      <header className="pagehead">
        <div className="shell modelhead">
          <div className="modelhead__copy">
            <Link to={`/modelos?linha=${platform.id}`} className="label modelhead__back">
              ← {platform.brand} · {platform.name}
            </Link>
            <SplitText as="h1" text={model.name} onView={false} className="modelhead__title" />
            <Reveal delay={0.15}>
              <p className="lead">{model.headline}</p>
            </Reveal>
          </div>

          {/* Recebe o elemento que veio da listagem. */}
          <motion.div layoutId={`art-${model.slug}`} className="modelhead__art">
            <Vehicle type={model.art} accent={platform.accentVar} title={model.name} />
          </motion.div>
        </div>
      </header>

      {/* Palco escuro: o único lugar onde o site escurece. */}
      <section className="bleed stage on-stage">
        <div className="stage__canvas">
          <Suspense fallback={<div className="stage__loading">Carregando o modelo 3D…</div>}>
            <VehicleScene config={config} />
          </Suspense>
        </div>
        <div className="stage__caption">
          <span className="label">Modelo 3D interativo</span>
          <strong className="stage__caption-name">{model.name}</strong>
        </div>
        <span className="stage__hint">Arraste para girar</span>
      </section>

      <section className="section">
        <div className="shell modelbody">
          <div className="modelbody__story">
            <Reveal>
              <span className="label">Por que ele existe</span>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="modelbody__prose">{model.story}</p>
            </Reveal>
            <ul className="highlights">
              {model.highlights.map((item, index) => (
                <Reveal as="li" key={item} delay={0.12 + index * 0.06}>
                  {item}
                </Reveal>
              ))}
            </ul>
          </div>

          <aside className="modelbody__engines">
            <span className="label">Motorização</span>
            <div className="engines">
              {model.engines.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  className={`engine${index === engineIndex ? ' is-active' : ''}`}
                  onClick={() => setEngineIndex(index)}
                  aria-pressed={index === engineIndex}
                >
                  <span className="engine__power data">
                    {option.power}
                    <em>hp</em>
                  </span>
                  <span className="engine__name">{option.name}</span>
                  <span className="engine__detail">{option.detail}</span>
                </button>
              ))}
            </div>
            <p className="engine__note label">
              Selecionado: {engine.name} · {engine.power} hp
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="label">Ficha técnica</span>
          <dl className="specgrid" style={{ marginTop: '1.2rem' }}>
            {model.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="label">{spec.label}</dt>
                <dd className="data">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="shell">
            <span className="label">Na mesma linha</span>
            <ul className="related">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/modelos/${item.slug}`} className="related__item">
                    <Vehicle type={item.art} accent={platform.accentVar} animate={false} title={item.name} />
                    <span className="related__name">{item.name}</span>
                    <span className="related__blurb">{item.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="shell">
        <div className="endcta">
          <div>
            <span className="label">Monte o seu</span>
            <h2>Escolha cor, motor e acessórios</h2>
          </div>
          <div className="endcta__actions">
            <MagneticButton href={`/montar?modelo=${model.slug}`} variant="solid" cursorLabel="Montar">
              Montar este modelo
            </MagneticButton>
            <MagneticButton href="/contato" variant="ghost">
              Falar com consultor
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}

export { MODELS }
