import { Marquee } from '../motion/Marquee'
import './brand-ticker.css'

const ITEMS = [
  'Sea-Doo',
  'Can-Am Off-Road',
  'Can-Am On-Road',
  'Sea-Doo Switch',
  'Rotax',
  'Peças genuínas',
  'Oficina autorizada',
]

export function BrandTicker() {
  return (
    <div className="ticker">
      <Marquee speed={5}>
        {ITEMS.map((item) => (
          <span className="ticker__item" key={item}>
            {item}
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 2l2.6 6.8L21 12l-6.4 3.2L12 22l-2.6-6.8L3 12l6.4-3.2z" fill="var(--brand-red)" />
            </svg>
          </span>
        ))}
      </Marquee>
    </div>
  )
}
