import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react'
import './scroll-words.css'

/**
 * Parágrafo que "acende" palavra por palavra conforme a seção atravessa a
 * viewport — o progresso do scroll controla diretamente a opacidade.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.28'],
  })

  const words = text.split(' ')

  if (reduced) {
    return <p className={`scroll-words${className ? ` ${className}` : ''}`}>{text}</p>
  }

  return (
    <p className={`scroll-words${className ? ` ${className}` : ''}`} ref={ref}>
      {words.map((word, index) => {
        const start = index / words.length
        const end = start + 1 / words.length
        return (
          <Word key={`${word}-${index}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        )
      })}
    </p>
  )
}

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const y = useTransform(progress, range, [8, 0])

  return (
    <span className="scroll-words__word">
      <motion.span style={{ opacity, y }}>{children}</motion.span>
    </span>
  )
}
