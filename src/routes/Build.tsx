import { Suspense, lazy, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { MagneticButton } from '../components/motion/MagneticButton'
import {
  ACCENTS,
  ACCESSORIES,
  ACCESSORY_CATEGORIES,
  CONTACT,
  FINISHES,
  MODELS,
  PAINTS,
  PLATFORMS,
  accessoriesFor,
  modelBySlug,
  modelsByPlatform,
  platformById,
  type PlatformId,
} from '../data/models'
import type { SceneConfig, VisualParts } from '../three/VehicleScene'
import type { FinishId } from '../three/materials'
import './page.css'
import './build.css'

const VehicleScene = lazy(() =>
  import('../three/VehicleScene').then((module) => ({ default: module.VehicleScene })),
)

/*
 * O estado inteiro vive na URL, no mesmo formato do "Monte o Seu" da BRP
 * (?platform=…&package=…). Assim uma montagem é um link: o cliente manda para
 * o consultor, recarrega e encontra tudo no lugar.
 */
const STEPS = [
  { id: 'plataforma', name: 'Plataforma' },
  { id: 'pacote', name: 'Modelo' },
  { id: 'motor', name: 'Motor' },
  { id: 'cor', name: 'Cor' },
  { id: 'acessorios', name: 'Acessórios' },
  { id: 'resumo', name: 'Resumo' },
] as const

export function Build() {
  const [params, setParams] = useSearchParams()

  // Um modelo pode chegar pela página do modelo (?modelo=slug).
  const incoming = params.get('modelo')
  const incomingModel = modelBySlug(incoming ?? undefined)

  const platformId = (params.get('platform') as PlatformId | null) ?? incomingModel?.platform ?? 'nautica'
  const packageSlug = params.get('package') ?? incomingModel?.slug ?? modelsByPlatform(platformId)[0].slug
  const model = modelBySlug(packageSlug) ?? modelsByPlatform(platformId)[0]
  const engineId = params.get('motor') ?? model.engines[0].id
  const engine = model.engines.find((option) => option.id === engineId) ?? model.engines[0]
  // Branco por padrão: preto sobre o palco escuro não lê no primeiro quadro.
  const paint = params.get('cor') ?? PAINTS[1].id
  const finish = (params.get('acab') as FinishId | null) ?? 'metallic'
  const accent = params.get('detalhe') ?? ACCENTS[0].id
  const chosen = (params.get('itens') ?? '').split(',').filter(Boolean)
  const step = params.get('etapa') ?? STEPS[0].id

  const patch = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params)
      next.delete('modelo')
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      setParams(next, { replace: true })
    },
    [params, setParams],
  )

  const toggleItem = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((item) => item !== id) : [...chosen, id]
    patch({ itens: next.join(',') || null })
  }

  const paintHex = PAINTS.find((option) => option.id === paint)?.hex ?? PAINTS[0].hex
  const accentHex = ACCENTS.find((option) => option.id === accent)?.hex ?? ACCENTS[0].hex

  // Acessórios com visual3d acendem a peça correspondente na cena.
  const parts: VisualParts = useMemo(() => {
    const map: VisualParts = {}
    for (const id of chosen) {
      const item = ACCESSORIES.find((entry) => entry.id === id)
      if (item?.visual3d) map[item.visual3d] = true
    }
    return map
  }, [chosen])

  const config: SceneConfig = useMemo(
    () => ({
      model: model.scene,
      color: paintHex,
      finish,
      accent: accentHex,
      env: 'studio',
      moving: false,
      autoRotate: true,
      parts,
    }),
    [model.scene, paintHex, finish, accentHex, parts],
  )

  const available = accessoriesFor(platformId)
  const selected = ACCESSORIES.filter((item) => chosen.includes(item.id))

  /* Código curto: o cliente cita ao consultor em vez de ler a URL inteira. */
  const buildCode = useMemo(() => {
    const seed = [model.slug, engine.id, paint, finish, accent, ...chosen].join('|')
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
    return hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
  }, [model.slug, engine.id, paint, finish, accent, chosen])

  const summaryLines = [
    `Modelo: ${model.name}`,
    `Motor: ${engine.name} · ${engine.power} hp`,
    `Pintura: ${PAINTS.find((p) => p.id === paint)?.name} (${FINISHES.find((f) => f.id === finish)?.name})`,
    `Detalhes: ${ACCENTS.find((a) => a.id === accent)?.name}`,
    selected.length
      ? `Acessórios: ${selected.map((item) => item.name).join(', ')}`
      : 'Acessórios: nenhum',
    `Código da montagem: ${buildCode}`,
  ]

  const quoteHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `Monte o seu — ${model.name} (${buildCode})`,
  )}&body=${encodeURIComponent(
    ['Gostaria de um orçamento para esta montagem:', '', ...summaryLines, '', window.location.href].join('\n'),
  )}`

  return (
    <div className="build">
      <header className="pagehead">
        <div className="shell">
          <span className="label pagehead__kicker">Monte o seu</span>
          <h1>{model.name}</h1>
        </div>
      </header>

      {/* Trilha de etapas — sequência real, por isso numerada. */}
      <div className="shell">
        <ol className="steps-rail">
          {STEPS.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                className={`steps-rail__btn${step === item.id ? ' is-active' : ''}`}
                onClick={() => patch({ etapa: item.id })}
                aria-current={step === item.id ? 'step' : undefined}
              >
                <span className="data">{index + 1}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="build__layout shell">
        <div className="build__stage on-stage">
          <div className="stage__canvas">
            <Suspense fallback={<div className="stage__loading">Carregando o modelo 3D…</div>}>
              <VehicleScene config={config} />
            </Suspense>
          </div>
          <span className="stage__hint">Arraste para girar</span>
        </div>

        <div className="build__panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="build__step"
            >
              {step === 'plataforma' && (
                <Choice label="Escolha a plataforma">
                  {PLATFORMS.map((platform) => (
                    <Option
                      key={platform.id}
                      active={platform.id === platformId}
                      title={`${platform.brand} ${platform.name}`}
                      detail={platform.tagline}
                      onClick={() =>
                        patch({
                          platform: platform.id,
                          package: modelsByPlatform(platform.id)[0].slug,
                          motor: null,
                          itens: null,
                          etapa: 'pacote',
                        })
                      }
                    />
                  ))}
                </Choice>
              )}

              {step === 'pacote' && (
                <Choice label="Escolha o modelo">
                  {modelsByPlatform(platformId).map((option) => (
                    <Option
                      key={option.slug}
                      active={option.slug === model.slug}
                      title={option.name}
                      detail={option.blurb}
                      onClick={() => patch({ package: option.slug, motor: null, etapa: 'motor' })}
                    />
                  ))}
                </Choice>
              )}

              {step === 'motor' && (
                <Choice label="Escolha a motorização">
                  {model.engines.map((option) => (
                    <Option
                      key={option.id}
                      active={option.id === engine.id}
                      title={`${option.power} hp · ${option.name}`}
                      detail={option.detail}
                      onClick={() => patch({ motor: option.id, etapa: 'cor' })}
                    />
                  ))}
                </Choice>
              )}

              {step === 'cor' && (
                <>
                  <Choice label="Pintura" inline>
                    {PAINTS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        title={option.name}
                        aria-label={option.name}
                        aria-pressed={option.id === paint}
                        className={`swatch${option.id === paint ? ' is-active' : ''}`}
                        style={{ ['--swatch' as string]: option.hex }}
                        onClick={() => patch({ cor: option.id })}
                      />
                    ))}
                  </Choice>
                  <Choice label="Acabamento" inline>
                    {FINISHES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={option.id === finish}
                        className={`chip${option.id === finish ? ' is-active' : ''}`}
                        onClick={() => patch({ acab: option.id })}
                      >
                        {option.name}
                      </button>
                    ))}
                  </Choice>
                  <Choice label="Rodas e detalhes" inline>
                    {ACCENTS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        title={option.name}
                        aria-label={option.name}
                        aria-pressed={option.id === accent}
                        className={`swatch${option.id === accent ? ' is-active' : ''}`}
                        style={{ ['--swatch' as string]: option.hex }}
                        onClick={() => patch({ detalhe: option.id })}
                      />
                    ))}
                  </Choice>
                </>
              )}

              {step === 'acessorios' && (
                <div className="accessories">
                  {ACCESSORY_CATEGORIES.map((category) => {
                    const items = available.filter((item) => item.category === category.id)
                    if (!items.length) return null
                    return (
                      <section key={category.id}>
                        <h3 className="label">{category.name}</h3>
                        <ul>
                          {items.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                className={`accessory${chosen.includes(item.id) ? ' is-on' : ''}`}
                                onClick={() => toggleItem(item.id)}
                                aria-pressed={chosen.includes(item.id)}
                              >
                                <span className="accessory__check" aria-hidden="true" />
                                <span className="accessory__body">
                                  <strong>{item.name}</strong>
                                  <span>{item.description}</span>
                                </span>
                                {item.visual3d && <span className="accessory__tag label">Aparece no 3D</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              )}

              {step === 'resumo' && (
                <div className="summary">
                  <h3 className="label">Sua montagem</h3>
                  <dl>
                    {summaryLines.map((line) => {
                      const [key, ...rest] = line.split(': ')
                      return (
                        <div key={line}>
                          <dt className="label">{key}</dt>
                          <dd>{rest.join(': ')}</dd>
                        </div>
                      )
                    })}
                  </dl>
                  <p className="summary__note">
                    Os valores dependem de lote, câmbio e disponibilidade. Envie a montagem e a
                    loja responde com o preço fechado desta configuração.
                  </p>
                  <MagneticButton href={quoteHref} variant="solid" cursorLabel="Enviar">
                    Pedir orçamento desta montagem
                  </MagneticButton>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="build__foot">
            <div>
              <span className="label">Código</span>
              <strong className="data build__code">{buildCode}</strong>
            </div>
            <div>
              <span className="label">Selecionados</span>
              <strong className="data">{selected.length} acessórios</strong>
            </div>
            <button
              type="button"
              className="build__next"
              onClick={() => {
                const index = STEPS.findIndex((item) => item.id === step)
                patch({ etapa: STEPS[Math.min(STEPS.length - 1, index + 1)].id })
              }}
            >
              {step === 'resumo' ? 'Revisar' : 'Próxima etapa →'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}

function Choice({
  label,
  inline,
  children,
}: {
  label: string
  inline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="choice">
      <h3 className="label">{label}</h3>
      <div className={inline ? 'choice__inline' : 'choice__stack'}>{children}</div>
    </div>
  )
}

function Option({
  active,
  title,
  detail,
  onClick,
}: {
  active: boolean
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button type="button" className={`option${active ? ' is-active' : ''}`} onClick={onClick} aria-pressed={active}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  )
}

export { MODELS, platformById }
