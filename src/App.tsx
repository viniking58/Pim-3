import { Suspense, lazy, useRef, useState } from 'react'
import { useScroll, useSpring, useInView } from 'motion/react'
import { useSmoothScroll } from './hooks/useSmoothScroll'

// A cena de fundo carrega três.js inteiro. Mantê-la fora do carregamento
// inicial preserva o primeiro paint: a página aparece, a cena entra depois.
const Backdrop = lazy(() =>
  import('./three/Backdrop').then((module) => ({ default: module.Backdrop })),
)
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { ScrollProgress } from './components/ScrollProgress'
import { SectionTransition } from './components/motion/SectionTransition'
import { Nav } from './components/sections/Nav'
import { Hero } from './components/sections/Hero'
import { BrandTicker } from './components/sections/BrandTicker'
import { Fleet } from './components/sections/Fleet'
import { Configurator } from './components/sections/Configurator'
import { Showcase } from './components/sections/Showcase'
import { Manifesto } from './components/sections/Manifesto'
import { Services } from './components/sections/Services'
import { Store } from './components/sections/Store'
import { Testimonials } from './components/sections/Testimonials'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'

export default function App() {
  const [ready, setReady] = useState(false)
  useSmoothScroll()

  // Progresso da página inteira, amortecido: é ele que dirige a câmera da
  // cena de fundo, então precisa chegar lá já suavizado.
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 24, restDelta: 0.0005 })

  // O configurador tem a própria cena WebGL. Enquanto ele está em tela, o
  // fundo congela — duas cenas pesadas ao mesmo tempo derrubam o frame rate.
  const configuratorRef = useRef<HTMLDivElement>(null)
  const configuratorVisible = useInView(configuratorRef, { margin: '20% 0px' })

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <SectionTransition />
      <Suspense fallback={null}>
        <Backdrop progress={progress} active={!configuratorVisible} />
      </Suspense>
      <div className="grain" aria-hidden="true" />

      <a className="skip-link" href="#linha">
        Ir para o conteúdo
      </a>

      <Nav />

      <main data-ready={ready}>
        <Hero />
        <BrandTicker />
        <Fleet />
        <div ref={configuratorRef}>
          <Configurator />
        </div>
        <Showcase />
        <Manifesto />
        <Services />
        <Store />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </>
  )
}
