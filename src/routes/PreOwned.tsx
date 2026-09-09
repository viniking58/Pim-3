import { Link } from 'react-router-dom'
import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { MagneticButton } from '../components/motion/MagneticButton'
import { Vehicle } from '../graphics/Vehicle'
import './page.css'
import './editorial.css'

/*
 * Estoque de seminovos muda toda semana. Em vez de inventar unidades, a página
 * explica o critério de aceitação e leva ao consultor — quando houver um feed
 * de estoque, ele entra aqui sem mudar o layout.
 */
const CHECKS = [
  'Compressão e horímetro conferidos no diagnóstico oficial BRP',
  'Casco, quilha e sponsons inspecionados item a item',
  'Troca de fluidos, filtros e velas antes de entrar no showroom',
  'Histórico de revisões e garantia verificado no sistema da fábrica',
  'Documentação e transferência conduzidas pela loja',
]

export function PreOwned() {
  return (
    <>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <div>
            <span className="label pagehead__kicker">Seminovos</span>
            <SplitText as="h1" text="Só entra o que passaria pela nossa oficina" onView={false} />
          </div>
          <Reveal delay={0.15}>
            <p className="lead">
              Cada unidade é avaliada pela mesma equipe que faz a revisão dos zero-quilômetro. O
              que não passa, não vai para o piso de vendas.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="section">
        <div className="shell preowned">
          <ol className="checks">
            {CHECKS.map((check, index) => (
              <Reveal as="li" key={check} delay={index * 0.06}>
                <span className="data">{String(index + 1).padStart(2, '0')}</span>
                {check}
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.2} className="preowned__art">
            <Vehicle type="jetski" accent="var(--brand-marine)" title="Moto aquática seminova" />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="shell stocknote">
          <span className="label">Estoque</span>
          <p className="lead">
            O estoque de seminovos gira rápido e muda toda semana. Fale com um consultor para
            saber o que está disponível hoje — ou registre o que você procura e a loja avisa
            quando entrar.
          </p>
          <div className="endcta__actions" style={{ marginTop: '1.5rem' }}>
            <MagneticButton href="/contato" variant="solid" cursorLabel="Consultar">
              Consultar estoque
            </MagneticButton>
            <Link to="/modelos" className="mag-btn mag-btn--ghost">
              <span className="mag-btn__fill" aria-hidden="true" />
              <span className="mag-btn__label">Ver os zero-quilômetro</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
