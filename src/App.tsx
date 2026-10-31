import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CaseStudyPage from './pages/CaseStudyPage'

// Each demo is its own chunk, so the bundle sizes of "before" and "after" can be compared
const BeforePage = lazy(() => import('./pages/BeforePage'))
const AfterPage = lazy(() => import('./pages/AfterPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CaseStudyPage />} />
          <Route path="before" element={<BeforePage />} />
          <Route path="after" element={<AfterPage />} />
          <Route path="*" element={<CaseStudyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
