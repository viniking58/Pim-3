import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useMagnetic } from '../../hooks/useMagnetic'
import './magnetic-button.css'

type MagneticButtonProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  /** `solid` = preenchido em vermelho, `ghost` = contorno. */
  variant?: 'solid' | 'ghost'
  className?: string
  cursorLabel?: string
  /** Tipo do elemento nativo quando renderizado como <button>. */
  type?: 'button' | 'submit'
}

/** CTA com atração magnética ao ponteiro e preenchimento animado no hover. */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'solid',
  className,
  cursorLabel,
  type = 'button',
}: MagneticButtonProps) {
  const { x, y, handlers } = useMagnetic(0.3)
  const classes = `mag-btn mag-btn--${variant}${className ? ` ${className}` : ''}`

  const content = (
    <>
      <span className="mag-btn__fill" aria-hidden="true" />
      <span className="mag-btn__label">{children}</span>
      <span className="mag-btn__arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path
            d="M3 13L13 3M13 3H5.5M13 3v7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        style={{ x, y }}
        data-cursor={cursorLabel}
        {...handlers}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      className={classes}
      style={{ x, y }}
      onClick={onClick}
      data-cursor={cursorLabel}
      {...handlers}
    >
      {content}
    </motion.button>
  )
}
