import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { MagneticButton } from '../components/motion/MagneticButton'
import { SERVICES, CONTACT } from '../data/models'
import './page.css'
import './editorial.css'

export function Services() {
  return (
    <>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <div>
            <span className="label pagehead__kicker">Depois da venda</span>
            <SplitText as="h1" text="A loja não termina na entrega" onView={false} />
          </div>
          <Reveal delay={0.15}>
            <p className="lead">
              Estrutura autorizada BRP para manter o veículo dentro do padrão de fábrica: oficina
              com diagnóstico oficial, peças genuínas em estoque e revisão programada.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="section">
        <div className="shell">
          <ul className="editorial-grid">
            {SERVICES.map((service, index) => (
              <Reveal as="li" key={service.id} delay={index * 0.06} className="editorial-item">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section on-stage bleed">
        <div className="shell quote">
          <p className="quote__text">
            Um veículo BRP fora da rede autorizada perde garantia e histórico. Aqui ele mantém os
            dois — e o valor de revenda junto.
          </p>
          <span className="label">Oficina P1 · {CONTACT.city}</span>
        </div>
      </section>

      <section className="shell">
        <div className="endcta">
          <div>
            <span className="label">Agende</span>
            <h2>Traga o seu para revisão</h2>
          </div>
          <div className="endcta__actions">
            <MagneticButton href="/contato" variant="solid" cursorLabel="Agendar">
              Agendar oficina
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}
