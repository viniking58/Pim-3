import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Shell } from './components/shell/Shell'
import { Home } from './routes/Home'
import { Models } from './routes/Models'
import { ModelDetail } from './routes/ModelDetail'
import { Build } from './routes/Build'
import { Services } from './routes/Services'
import { Dealer } from './routes/Dealer'
import { PreOwned } from './routes/PreOwned'
import { Contact } from './routes/Contact'
import { NotFound } from './routes/NotFound'
import { Cursor } from './components/Cursor'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import './styles/base.css'
import './styles/app.css'

function App() {
  useSmoothScroll()

  return (
    <BrowserRouter>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="modelos" element={<Models />} />
          <Route path="modelos/:slug" element={<ModelDetail />} />
          <Route path="montar" element={<Build />} />
          <Route path="servicos" element={<Services />} />
          <Route path="concessionaria" element={<Dealer />} />
          <Route path="seminovos" element={<PreOwned />} />
          <Route path="contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
