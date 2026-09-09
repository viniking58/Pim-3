import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { Reveal } from '../motion/Reveal'
import { MagneticButton } from '../motion/MagneticButton'
import {
  ACCENTS,
  ENVIRONMENTS,
  FINISHES,
  MODEL_OPTIONS,
  PAINTS,
} from '../../data/configurator'
import type { ModelId, SceneConfig } from '../../three/VehicleScene'
import type { FinishId } from '../../three/materials'
import type { EnvId } from '../../three/Stage3D'
import './configurator.css'

// A cena WebGL só entra no bundle quando o visitante chega nesta seção.
const VehicleScene = lazy(() =>
  import('../../three/VehicleScene').then((module) => ({ default: module.VehicleScene })),
)

export function Configurator() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // Só monta o canvas depois que a seção aparece, para não pagar WebGL no topo.
  const inView = useInView(ref, { once: true, margin: '25% 0px' })
  // …e pausa o loop de render sempre que ela sai de vista.
  const onScreen = useInView(ref, { margin: '10% 0px' })

  const [model, setModel] = useState<ModelId>('utv')
  const [paint, setPaint] = useState<string>(PAINTS[2].hex)
  const [finish, setFinish] = useState<FinishId>('gloss')
  const [accent, setAccent] = useState<string>(ACCENTS[0].hex)
  const [env, setEnv] = useState<EnvId>('studio')
  const [moving, setMoving] = useState(false)
  const [autoRotate, setAutoRotate] = useState(!reduced)

  const active = MODEL_OPTIONS.find((option) => option.id === model)!
  const paintName = PAINTS.find((option) => option.hex === paint)?.name ?? ''
  const accentName = ACCENTS.find((option) => option.hex === accent)?.name ?? ''
  const finishName = FINISHES.find((option) => option.id === finish)?.name ?? ''

  const config: SceneConfig = useMemo(
    () => ({ model, color: paint, finish, accent, env, moving, autoRotate }),
    [model, paint, finish, accent, env, moving, autoRotate],
  )

  const summary = `${active.name} · ${paintName} ${finishName.toLowerCase()} · detalhes ${accentName.toLowerCase()}`

  return (
    <section className="section configurator" id="configurador" ref={ref}>
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow">Configurador 3D</span>
          </Reveal>
          <SplitText as="h2" text="Monte a sua do seu jeito" className="configurator__title" />
          <Reveal delay={0.1}>
            <p className="lead">
              Modelos em 3D de verdade, renderizados ao vivo no seu navegador. Arraste para girar
              360°, troque pintura, acabamento e detalhes e veja a luz do estúdio responder na hora.
            </p>
          </Reveal>
        </div>

        <div className="configurator__layout">
          {/* ---------------------------------------------------- Palco 3D */}
          <div className="configurator__stage">
            <div className="configurator__canvas">
              {inView ? (
                <Suspense fallback={<StageFallback />}>
                  <VehicleScene config={config} active={onScreen} />
                </Suspense>
              ) : (
                <StageFallback />
              )}
            </div>

            <div className="configurator__overlay">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  className="configurator__badge"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="configurator__badge-family">{active.family}</span>
                  <strong>{active.name}</strong>
                  <span className="configurator__badge-blurb">{active.blurb}</span>
                </motion.div>
              </AnimatePresence>

              <span className="configurator__hint">
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M8 8L4 12l4 4M16 8l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Arraste para girar
              </span>
            </div>

            <dl className="configurator__specs">
              {active.specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* --------------------------------------------------- Opções */}
          <div className="configurator__panel">
            <Group label="Modelo">
              <div className="configurator__models">
                {MODEL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`configurator__model${model === option.id ? ' is-active' : ''}`}
                    onClick={() => setModel(option.id)}
                    aria-pressed={model === option.id}
                  >
                    <span className="configurator__model-name">{option.name}</span>
                    <span className="configurator__model-family">{option.family}</span>
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Pintura" value={paintName}>
              <div className="configurator__swatches">
                {PAINTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`configurator__swatch${paint === option.hex ? ' is-active' : ''}`}
                    style={{ ['--swatch' as string]: option.hex }}
                    onClick={() => setPaint(option.hex)}
                    aria-label={option.name}
                    aria-pressed={paint === option.hex}
                    title={option.name}
                  />
                ))}
              </div>
            </Group>

            <Group label="Acabamento" value={finishName}>
              <div className="configurator__chips">
                {FINISHES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`configurator__chip${finish === option.id ? ' is-active' : ''}`}
                    onClick={() => setFinish(option.id)}
                    aria-pressed={finish === option.id}
                  >
                    <span>{option.name}</span>
                    <em>{option.hint}</em>
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Rodas e detalhes" value={accentName}>
              <div className="configurator__swatches">
                {ACCENTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`configurator__swatch${accent === option.hex ? ' is-active' : ''}`}
                    style={{ ['--swatch' as string]: option.hex }}
                    onClick={() => setAccent(option.hex)}
                    aria-label={option.name}
                    aria-pressed={accent === option.hex}
                    title={option.name}
                  />
                ))}
              </div>
            </Group>

            <Group label="Ambiente">
              <div className="configurator__chips">
                {ENVIRONMENTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`configurator__chip${env === option.id ? ' is-active' : ''}`}
                    onClick={() => setEnv(option.id)}
                    aria-pressed={env === option.id}
                  >
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Movimento">
              <div className="configurator__toggles">
                <Toggle label="Girar sozinho" on={autoRotate} onChange={setAutoRotate} />
                <Toggle label="Em movimento" on={moving} onChange={setMoving} />
              </div>
            </Group>

            <div className="configurator__footer">
              <p className="configurator__summary">{summary}</p>
              <MagneticButton href="#contato" variant="solid" cursorLabel="Proposta">
                Solicitar proposta
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Group({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children: React.ReactNode
}) {
  return (
    <div className="configurator__group">
      <div className="configurator__group-head">
        <span className="configurator__group-label">{label}</span>
        {value && <span className="configurator__group-value">{value}</span>}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string
  on: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      className={`configurator__toggle${on ? ' is-on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className="configurator__toggle-track">
        <motion.span
          className="configurator__toggle-knob"
          animate={{ x: on ? 18 : 0 }}
          transition={{ type: 'spring', stiffness: 480, damping: 30 }}
        />
      </span>
      {label}
    </button>
  )
}

/** Placeholder enquanto o WebGL não está montado. */
function StageFallback() {
  return (
    <div className="configurator__fallback">
      <span className="configurator__spinner" aria-hidden="true" />
      <span>Carregando o modelo 3D…</span>
    </div>
  )
}
