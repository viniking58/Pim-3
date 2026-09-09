import { useEffect, useState } from 'react'

/**
 * Diz qual seção está ocupando a viewport agora. Em vez de disparar no
 * primeiro pixel visível, escolhe a seção com maior área em tela — assim o
 * indicador não pisca entre duas quando elas se encontram na borda.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!targets.length) return

    const ratios = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let best: string | null = null
        let bestRatio = 0
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        }

        if (best && bestRatio > 0.08) setActive(best)
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-72px 0px -20% 0px' },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [ids])

  return active
}
