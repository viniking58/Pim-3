import { Marquee } from '../motion/Marquee'
import { Reveal } from '../motion/Reveal'
import { SplitText } from '../motion/SplitText'
import { TESTIMONIALS } from '../../data/site'
import './testimonials.css'

export function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="shell">
        <div className="section-head">
        <Reveal>
          <span className="eyebrow">Quem já saiu daqui pilotando</span>
        </Reveal>
          <SplitText as="h2" text="Histórias do showroom" className="testimonials__title" />
        </div>
      </div>

      <Marquee speed={3.5} direction={-1}>
        {TESTIMONIALS.map((item) => (
          <figure className="tcard" key={item.author}>
            <svg className="tcard__quote" viewBox="0 0 32 24" aria-hidden="true">
              <path
                d="M13 24V12.6C13 5.9 17.2 1.3 24 0l1.6 3.7c-3.9 1-6.2 3.4-6.6 6.4H24V24H13Zm-13 0V12.6C0 5.9 4.2 1.3 11 0l1.6 3.7c-3.9 1-6.2 3.4-6.6 6.4H11V24H0Z"
                fill="var(--brand-red)"
              />
            </svg>
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              <strong>{item.author}</strong>
              <span>{item.detail}</span>
            </figcaption>
          </figure>
        ))}
      </Marquee>

      <Marquee speed={3.5} direction={1} className="testimonials__row-two">
        {[...TESTIMONIALS].reverse().map((item) => (
          <figure className="tcard tcard--muted" key={`b-${item.author}`}>
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              <strong>{item.author}</strong>
              <span>{item.detail}</span>
            </figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  )
}
