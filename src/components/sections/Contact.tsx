import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { Reveal } from '../motion/Reveal'
import { MagneticButton } from '../motion/MagneticButton'
import { CONTACT, PRODUCTS } from '../../data/site'
import './contact.css'

const INTERESTS = [
  'Sea-Doo — jet ski',
  'Can-Am Off-Road',
  'Can-Am On-Road',
  'Sea-Doo Switch',
  'Seminovos',
  'Peças e oficina',
]

export function Contact() {
  const [sent, setSent] = useState(false)

  /**
   * Sem back-end: montamos a mensagem e abrimos o cliente de e-mail do
   * visitante, para que o contato chegue de verdade à loja.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('nome') ?? '')
    const phone = String(data.get('telefone') ?? '')
    const interest = String(data.get('interesse') ?? '')
    const message = String(data.get('mensagem') ?? '')

    const subject = `Contato pelo site — ${interest || 'Interesse geral'}`
    const body = [
      `Nome: ${name}`,
      `Telefone: ${phone}`,
      `Interesse: ${interest}`,
      '',
      message,
    ].join('\n')

    window.location.href = `mailto:${CONTACT.emailParts}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section className="section contact" id="contato">
      <div className="shell contact__inner">
        <div className="contact__copy">
          <Reveal>
            <span className="eyebrow">Fale com a loja</span>
          </Reveal>
          <SplitText as="h2" text="Vamos escolher a sua máquina" className="contact__title" />
          <Reveal delay={0.1}>
            <p className="lead">
              Conte onde você pilota e com quem anda. Um consultor responde com as versões
              disponíveis, acessórios recomendados e condições atuais.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ul className="contact__channels">
              <li>
                <span className="contact__channel-key">Peças e vendas</span>
                <a href={`mailto:${CONTACT.emailParts}`}>{CONTACT.emailParts}</a>
              </li>
              <li>
                <span className="contact__channel-key">Garantia</span>
                <a href={`mailto:${CONTACT.emailWarranty}`}>{CONTACT.emailWarranty}</a>
              </li>
              <li>
                <span className="contact__channel-key">Showroom</span>
                <span>
                  {CONTACT.address} — {CONTACT.city}
                </span>
              </li>
              <li>
                <span className="contact__channel-key">Atendimento</span>
                <span>{CONTACT.hours}</span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="contact__socials">
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener">
                Instagram
              </a>
              <a href={CONTACT.facebook} target="_blank" rel="noreferrer noopener">
                Facebook
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="contact__form-wrap">
          <form className="contact__form" onSubmit={handleSubmit}>
            <Field name="nome" label="Seu nome" required />
            <Field name="telefone" label="Telefone ou WhatsApp" type="tel" required />

            <label className="field field--select">
              <select name="interesse" defaultValue="" required>
                <option value="" disabled>
                  Selecione
                </option>
                {INTERESTS.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
              <span className="field__label field__label--static">Tenho interesse em</span>
              <span className="field__line" />
            </label>

            <label className="field field--area">
              <textarea name="mensagem" rows={4} placeholder=" " />
              <span className="field__label">Onde você pretende usar? (opcional)</span>
              <span className="field__line" />
            </label>

            <div className="contact__submit">
              <MagneticButton type="submit" cursorLabel="Enviar">
                Enviar para a loja
              </MagneticButton>
              <AnimatePresence>
                {sent && (
                  <motion.span
                    className="contact__sent"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Abrimos seu app de e-mail com a mensagem pronta — é só enviar.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="contact__disclaimer">
              {PRODUCTS.length} linhas em showroom. Versões e disponibilidade sujeitas a
              confirmação com o consultor.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

/** Campo com rótulo flutuante e sublinhado que cresce no foco. */
function Field({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="field">
      <input type={type} name={name} placeholder=" " required={required} autoComplete="on" />
      <span className="field__label">{label}</span>
      <span className="field__line" />
    </label>
  )
}
