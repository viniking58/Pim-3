import './page-background.css'

/**
 * Fundo da página: malha de pontos, sopros de cor da marca e uma vinheta de
 * borda. Existe para dar profundidade — sem isso o site fica num branco
 * chapado onde não se distingue fundo de conteúdo.
 *
 * Tudo em CSS: nada de canvas, nada de bibliotecas. O custo é um elemento
 * fixo com gradientes, e a animação para em prefers-reduced-motion.
 */
export function PageBackground() {
  return (
    <div className="pagebg" aria-hidden="true">
      <div className="pagebg__grid" />
      <div className="pagebg__bloom pagebg__bloom--marine" />
      <div className="pagebg__bloom pagebg__bloom--action" />
      <div className="pagebg__bloom pagebg__bloom--terra" />
      <div className="pagebg__vignette" />
    </div>
  )
}
