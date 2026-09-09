import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { Vehicle } from '../graphics/Vehicle'
import { MODELS, PLATFORMS, platformById, type PlatformId } from '../data/models'
import './page.css'
import './models.css'

export function Models() {
  // A linha escolhida vive na URL: o filtro é compartilhável, e a home aponta
  // direto para uma plataforma.
  const [params, setParams] = useSearchParams()
  const active = (params.get('linha') as PlatformId | null) ?? null

  const visible = useMemo(
    () => (active ? MODELS.filter((model) => model.platform === active) : MODELS),
    [active],
  )

  const setLine = (id: PlatformId | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set('linha', id)
    else next.delete('linha')
    setParams(next, { replace: true })
  }

  return (
    <>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <div>
            <span className="label pagehead__kicker">A linha completa</span>
            <SplitText as="h1" text="Dez modelos, quatro plataformas" onView={false} />
          </div>
          <Reveal delay={0.15}>
            <p className="lead">
              Tudo o que a P1 vende, das motos aquáticas ao utilitário de trabalho. Filtre pela
              linha ou percorra a lista inteira.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="shell">
        <div className="linefilter" role="tablist" aria-label="Filtrar por linha">
          <button
            type="button"
            role="tab"
            aria-selected={active === null}
            className={`linefilter__btn${active === null ? ' is-active' : ''}`}
            onClick={() => setLine(null)}
          >
            Todas
          </button>
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              role="tab"
              aria-selected={active === platform.id}
              className={`linefilter__btn${active === platform.id ? ' is-active' : ''}`}
              onClick={() => setLine(platform.id)}
            >
              {platform.brand} <span>{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="shell modelist">
        <AnimatePresence mode="popLayout">
          {visible.map((model, index) => {
            const platform = platformById(model.platform)
            return (
              <motion.article
                key={model.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="modelrow"
                style={{ ['--accent' as string]: platform.accentVar }}
              >
                <Link to={`/modelos/${model.slug}`} className="modelrow__link" data-cursor="Abrir">
                  <div className="modelrow__art">
                    {/* O mesmo layoutId existe no herói da página do modelo:
                        é o elemento que atravessa a rota. */}
                    <motion.div layoutId={`art-${model.slug}`}>
                      <Vehicle type={model.art} accent={platform.accentVar} title={model.name} />
                    </motion.div>
                  </div>

                  <div className="modelrow__body">
                    <span className="label modelrow__line">
                      {platform.brand} · {platform.name}
                    </span>
                    <h2>{model.name}</h2>
                    <p>{model.blurb}</p>

                    <dl className="modelrow__specs">
                      <div>
                        <dt className="label">Potência</dt>
                        <dd className="data">
                          {model.engines.length > 1
                            ? `${Math.min(...model.engines.map((e) => e.power))}–${Math.max(
                                ...model.engines.map((e) => e.power),
                              )}`
                            : model.engines[0].power}
                          <em> hp</em>
                        </dd>
                      </div>
                      <div>
                        <dt className="label">Motor</dt>
                        <dd className="data">{model.engines[0].name}</dd>
                      </div>
                      <div>
                        <dt className="label">Versões</dt>
                        <dd className="data">{model.engines.length}</dd>
                      </div>
                    </dl>
                  </div>

                  {model.badge && <span className="modelrow__badge label">{model.badge}</span>}
                </Link>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </section>
    </>
  )
}
