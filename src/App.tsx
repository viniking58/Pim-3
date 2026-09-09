import { useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { ScrollProgress } from './components/ScrollProgress'
import { Nav } from './components/sections/Nav'
import { Hero } from './components/sections/Hero'
import { BrandTicker } from './components/sections/BrandTicker'
import { Fleet } from './components/sections/Fleet'
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

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <a className="skip-link" href="#linha">
        Ir para o conteúdo
      </a>

      <Nav />

      <main data-ready={ready}>
        <Hero />
        <BrandTicker />
        <Fleet />
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
