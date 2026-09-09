import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { ScrollWords } from '../components/motion/ScrollWords'
import { MagneticButton } from '../components/motion/MagneticButton'
import { CONTACT } from '../data/models'
import './page.css'
import './editorial.css'

const FACTS = [
  { label: 'Showroom', value: '800 m²' },
  { label: 'Bairro', value: 'Jardim Aquarius' },
  { label: 'Cidade', value: 'São José dos Campos' },
  { label: 'Rede', value: 'Autorizada BRP' },
]

export function Dealer() {
  return (
    <>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <div>
            <span className="label pagehead__kicker">A concessionária</span>
            <SplitText as="h1" text="800 m² no Jardim Aquarius" onView={false} />
          </div>
          <Reveal delay={0.15}>
            <p className="lead">
              Showroom, boxes de oficina e estoque de peças no mesmo endereço. A primeira
              concessionária BRP do Vale do Paraíba.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <dl className="specgrid">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="label">{fact.label}</dt>
                <dd className="data">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <ScrollWords
            className="manifesto"
            text="Você entra para ver um modelo e sai sabendo exatamente como ele se comporta na água ou na trilha, porque quem atende aqui pilota o que vende."
          />
        </div>
      </section>

      <section className="section">
        <div className="shell visit">
          <div>
            <span className="label">Endereço</span>
            <address>
              {CONTACT.address}
              <br />
              {CONTACT.city}
              <br />
              {CONTACT.zip}
            </address>
          </div>
          <div>
            <span className="label">Atendimento</span>
            <p>{CONTACT.hours}</p>
          </div>
          <div>
            <span className="label">Contato</span>
            <p>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              <br />
              <a href={`mailto:${CONTACT.emailWarranty}`}>{CONTACT.emailWarranty}</a>
            </p>
          </div>
        </div>
      </section>

      <section className="shell">
        <div className="endcta">
          <div>
            <span className="label">Visita</span>
            <h2>Marque um horário e suba em um</h2>
          </div>
          <div className="endcta__actions">
            <MagneticButton href="/contato" variant="solid">
              Agendar visita
            </MagneticButton>
            <MagneticButton href="/modelos" variant="ghost">
              Ver a linha
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}
