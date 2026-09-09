import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

/** Scroll suave com inércia (Lenis), sincronizado ao rAF do navegador. */
export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      // Inércia mais longa: o site deve deslizar, não saltar linha a linha.
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      wheelMultiplier: 0.9,
      lerp: 0.08,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    const onAnchor = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a[href^="#"]')
      if (!(target instanceof HTMLAnchorElement)) return
      const id = target.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (!el) return
      event.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.8 })
    }

    document.addEventListener('click', onAnchor)
    return () => {
      document.removeEventListener('click', onAnchor)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reduced])
}
