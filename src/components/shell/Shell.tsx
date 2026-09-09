import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { MagneticButton } from '../motion/MagneticButton'
import { RouteTransition } from './RouteTransition'
import { PageBackground } from './PageBackground'
import { CONTACT } from '../../data/models'
import './shell.css'

const NAV = [
  { to: '/modelos', label: 'Modelos' },
  { to: '/montar', label: 'Monte o seu' },
  { to: '/seminovos', label: 'Seminovos' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/concessionaria', label: 'A concessionária' },
]

export function Shell() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => setSolid(latest > 24))

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <PageBackground />

      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>

      <header className={`masthead${solid ? ' is-solid' : ''}`}>
        <div className="masthead__inner shell">
          <Link className="wordmark" to="/" aria-label="P1 Motorsports — início">
            <span className="wordmark__p1">P1</span>
            <span className="wordmark__rest">
              Motorsports
              <em>Concessionária autorizada BRP</em>
            </span>
          </Link>

          <nav className="masthead__nav" aria-label="Navegação principal">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `navlink${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="masthead__actions">
            <MagneticButton href="/contato" variant="solid" cursorLabel="Falar">
              Fale com a loja
            </MagneticButton>
            <button
              type="button"
              className={`burger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="drawer"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="drawer__inner shell">
              <ul>
                {[{ to: '/', label: 'Início' }, ...NAV, { to: '/contato', label: 'Contato' }].map(
                  (item, index) => (
                    <motion.li
                      key={item.to}
                      initial={{ y: 48, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 24, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.16 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link to={item.to} onClick={() => setMenuOpen(false)}>
                        {item.label}
                      </Link>
                    </motion.li>
                  ),
                )}
              </ul>
              <p className="drawer__meta label">
                {CONTACT.address} · {CONTACT.city}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="conteudo">
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>

      <SiteFooter />
    </>
  )
}

function SiteFooter() {
  return (
    <footer className="foot on-stage">
      <div className="shell foot__top">
        <div className="foot__brand">
          <span className="foot__brand-mark">P1</span>
          <p className="lead">
            Concessionária autorizada BRP no Vale do Paraíba. Sea-Doo, Can-Am e Switch, com
            oficina e peças genuínas no mesmo endereço.
          </p>
        </div>

        <nav className="foot__col" aria-label="Modelos">
          <h4 className="label">Modelos</h4>
          <ul>
            {NAV.slice(0, 3).map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="foot__col" aria-label="A loja">
          <h4 className="label">A loja</h4>
          <ul>
            <li>
              <Link to="/servicos">Serviços</Link>
            </li>
            <li>
              <Link to="/concessionaria">A concessionária</Link>
            </li>
            <li>
              <Link to="/contato">Contato</Link>
            </li>
          </ul>
        </nav>

        <div className="foot__col">
          <h4 className="label">Endereço</h4>
          <address>
            {CONTACT.address}
            <br />
            {CONTACT.city}
            <br />
            {CONTACT.zip}
          </address>
          <a className="foot__mail" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </div>
      </div>

      <div className="shell foot__bottom">
        <span>© {new Date().getFullYear()} P1 Motorsports</span>
        <span>Sea-Doo, Can-Am, Switch e Rotax são marcas da BRP Inc.</span>
      </div>
    </footer>
  )
}
