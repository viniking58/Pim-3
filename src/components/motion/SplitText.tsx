import { motion, useReducedMotion } from 'motion/react'
import './split-text.css'

type SplitTextProps = {
  text: string
  className?: string
  /** Atraso base antes da primeira palavra. */
  delay?: number
  /** Intervalo entre palavras. */
  stagger?: number
  /** Anima ao entrar na viewport em vez de na montagem. */
  onView?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * Revela um texto palavra a palavra, cada uma subindo de dentro de uma
 * máscara — o efeito clássico de abertura de vitrine.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  onView = true,
  as = 'h2',
}: SplitTextProps) {
  const reduced = useReducedMotion()
  const Wrapper = motion[as]
  const words = text.split(' ')

  const animationProps = onView
    ? { whileInView: 'visible' as const, viewport: { once: true, margin: '-10% 0px' } }
    : { animate: 'visible' as const }

  if (reduced) {
    return <Wrapper className={className}>{text}</Wrapper>
  }

  return (
    <Wrapper
      className={className}
      initial="hidden"
      {...animationProps}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, index) => (
        <span className="split-word" key={`${word}-${index}`} aria-hidden="true">
          <motion.span
            className="split-word__inner"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              visible: { y: '0%', rotate: 0 },
            }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  )
}
