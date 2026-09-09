import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { MagneticButton } from '../motion/MagneticButton'
import './nav.css'

const LINKS = [
  { href: '#linha', label: 'A linha', index: '01' },
  { href: '#configurador', label: 'Configurador 3D', index: '02' },
  { href: '#experiencia', label: 'Experiência', index: '03' },
  { href: '#servicos', label: 'Serviços', index: '04' },
  { href: '#loja', label: 'A loja', index: '05' },
  { href: '#contato', label: 'Contato', index: '06' },
]

export function Nav() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(latest > 40)
    // Esconde ao descer, revela imediatamente ao subir.
    setHidden(latest > previous && latest > 260 && !menuOpen)
  })

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        className={`nav${scrolled ? ' is-scrolled' : ''}`}
        initial={{ y: -110 }}
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav__inner shell">
          <a className="nav__brand" href="#topo" aria-label="P1 Motorsports — início">
            <svg viewBox="0 0 120 44" aria-hidden="true">
              <path
                d="M6 38V6h20.5c8.4 0 13.8 5 13.8 12.6S34.9 31.4 26.5 31.4H16V38H6Zm10-15.4h8.2c2.9 0 4.7-1.6 4.7-4S27.1 14.6 24.2 14.6H16v8Z"
                fill="var(--brand-red)"
              />
              <path d="M48 6h9v32h-9z" fill="currentColor" />
              <text
                x="66"
                y="20"
                fontFamily="var(--font-mono)"
                fontSize="9"
                letterSpacing="1.6"
                fill="currentColor"
                opacity="0.72"
              >
                MOTOR
              </text>
              <text
                x="66"
                y="34"
                fontFamily="var(--font-mono)"
                fontSize="9"
                letterSpacing="1.6"
                fill="currentColor"
                opacity="0.72"
              >
                SPORTS
              </text>
            </svg>
          </a>

          <nav className="nav__links" aria-label="Navegação principal">
            {LINKS.map((link) => (
              <a className="nav__link" href={link.href} key={link.href}>
                <span className="nav__link-index">{link.index}</span>
                <span className="nav__link-text">
                  <span>{link.label}</span>
                  <span aria-hidden="true">{link.label}</span>
                </span>
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <MagneticButton href="#contato" variant="solid" cursorLabel="Falar">
              Fale com a loja
            </MagneticButton>
            <button
              type="button"
              className={`nav__burger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-overlay"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="nav-overlay__inner shell">
              <ul>
                {LINKS.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ y: 70, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.22 + index * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <a href={link.href} onClick={() => setMenuOpen(false)}>
                      <span className="nav-overlay__index">{link.index}</span>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.p
                className="nav-overlay__meta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Concessionária autorizada BRP · São José dos Campos — SP
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
