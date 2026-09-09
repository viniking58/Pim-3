import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '../components/motion/Reveal'
import { SplitText } from '../components/motion/SplitText'
import { MagneticButton } from '../components/motion/MagneticButton'
import { CONTACT, MODELS } from '../data/models'
import './page.css'
import './editorial.css'

export function Contact() {
  const [sent, setSent] = useState(false)

  /* Sem back-end: montamos a mensagem e abrimos o cliente de e-mail do
     visitante, para que o contato chegue de verdade à loja. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = [
      `Nome: ${data.get('nome')}`,
      `Telefone: ${data.get('telefone')}`,
      `Interesse: ${data.get('interesse')}`,
      '',
      String(data.get('mensagem') ?? ''),
    ].join('\n')

    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      `Contato pelo site — ${data.get('interesse')}`,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <div>
            <span className="label pagehead__kicker">Fale com a loja</span>
            <SplitText as="h1" text="Vamos escolher a sua máquina" onView={false} />
          </div>
          <Reveal delay={0.15}>
            <p className="lead">
              Conte onde você pilota e com quem anda. Um consultor responde com as versões
              disponíveis, acessórios recomendados e condições atuais.
            </p>
          </Reveal>
        </div>
      </header>

      <section className="section">
        <div className="shell contactgrid">
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="label">Seu nome</span>
              <input type="text" name="nome" required autoComplete="name" />
            </label>
            <label className="field">
              <span className="label">Telefone ou WhatsApp</span>
              <input type="tel" name="telefone" required autoComplete="tel" />
            </label>
            <label className="field">
              <span className="label">Tenho interesse em</span>
              <select name="interesse" defaultValue="" required>
                <option value="" disabled>
                  Selecione
                </option>
                {MODELS.map((model) => (
                  <option key={model.slug} value={model.name}>
                    {model.name}
                  </option>
                ))}
                <option value="Seminovos">Seminovos</option>
                <option value="Peças e oficina">Peças e oficina</option>
              </select>
            </label>
            <label className="field">
              <span className="label">Onde você pretende usar? (opcional)</span>
              <textarea name="mensagem" rows={4} />
            </label>

            <div className="form__submit">
              <MagneticButton type="submit" variant="solid" cursorLabel="Enviar">
                Enviar para a loja
              </MagneticButton>
              <AnimatePresence>
                {sent && (
                  <motion.span
                    className="form__sent label"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Abrimos seu app de e-mail com a mensagem pronta.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>

          <aside className="contactinfo">
            <div>
              <span className="label">Showroom</span>
              <address>
                {CONTACT.address}
                <br />
                {CONTACT.city} · {CONTACT.zip}
              </address>
            </div>
            <div>
              <span className="label">Atendimento</span>
              <p>{CONTACT.hours}</p>
            </div>
            <div>
              <span className="label">Peças e vendas</span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </div>
            <div>
              <span className="label">Garantia</span>
              <a href={`mailto:${CONTACT.emailWarranty}`}>{CONTACT.emailWarranty}</a>
            </div>
            <div className="contactinfo__social">
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener">
                Instagram
              </a>
              <a href={CONTACT.facebook} target="_blank" rel="noreferrer noopener">
                Facebook
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
