import { Link } from 'react-router-dom'
import './page.css'

export function NotFound() {
  return (
    <section className="section">
      <div className="shell">
        <span className="label">Erro 404</span>
        <h1 style={{ marginBlock: '1rem 1.5rem' }}>Esta página saiu de linha</h1>
        <p className="lead">
          O endereço não existe mais ou nunca existiu. A linha completa continua no lugar.
        </p>
        <p style={{ marginTop: '2rem' }}>
          <Link to="/modelos" className="mag-btn mag-btn--ghost">
            <span className="mag-btn__fill" aria-hidden="true" />
            <span className="mag-btn__label">Ver os modelos</span>
          </Link>
        </p>
      </div>
    </section>
  )
}
