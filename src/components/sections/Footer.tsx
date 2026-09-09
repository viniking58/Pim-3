import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { CONTACT } from '../../data/site'
import './footer.css'

const COLUMNS = [
  {
    title: 'Linha',
    links: [
      { label: 'Sea-Doo', href: '#linha' },
      { label: 'Can-Am Off-Road', href: '#linha' },
      { label: 'Can-Am On-Road', href: '#linha' },
      { label: 'Sea-Doo Switch', href: '#linha' },
    ],
  },
  {
    title: 'Loja',
    links: [
      { label: 'Experiência', href: '#experiencia' },
      { label: 'Serviços', href: '#servicos' },
      { label: 'Showroom', href: '#loja' },
      { label: 'Contato', href: '#contato' },
    ],
  },
]

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const markY = useTransform(scrollYProgress, [0, 1], [70, 0])
  const markOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 1])

  return (
    <footer className="footer" ref={ref}>
      <div className="shell footer__top">
        <div className="footer__brand">
          <span className="footer__brand-name">{CONTACT.name}</span>
          <span className="footer__brand-role">{CONTACT.role}</span>
          <address>
            {CONTACT.address}
            <br />
            {CONTACT.city} · {CONTACT.zip}
            <br />
            {CONTACT.hours}
          </address>
        </div>

        {COLUMNS.map((column) => (
          <nav className="footer__col" key={column.title} aria-label={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>
                    <span>{link.label}</span>
                    <span aria-hidden="true">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer__col">
          <h4>Contato</h4>
          <ul>
            <li>
              <a href={`mailto:${CONTACT.emailParts}`}>
                <span>{CONTACT.emailParts}</span>
                <span aria-hidden="true">{CONTACT.emailParts}</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener">
                <span>Instagram</span>
                <span aria-hidden="true">Instagram</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noreferrer noopener">
                <span>Facebook</span>
                <span aria-hidden="true">Facebook</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <motion.div
        className="footer__mark"
        style={reduced ? undefined : { y: markY, opacity: markOpacity }}
        aria-hidden="true"
      >
        P1 MOTORSPORTS
      </motion.div>

      <div className="shell footer__bottom">
        <span>© {new Date().getFullYear()} {CONTACT.name}. Todos os direitos reservados.</span>
        <span>Sea-Doo, Can-Am, Switch e Rotax são marcas da BRP Inc.</span>
        <a className="footer__top-link" href="#topo">
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  )
}
