import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'
import { SiteLayout } from './components/layout/SiteLayout'
import { Toaster } from './components/ui/Toast'
import HomePage from './pages/HomePage'
import TemplatesPage from './pages/TemplatesPage'
import ProjectsPage from './pages/ProjectsPage'
import NotFoundPage from './pages/NotFoundPage'

const EditorPage = lazy(() => import('./pages/EditorPage'))

// Static hosts without SPA rewrites (e.g. GitHub Pages) can build with VITE_HASH_ROUTER=1
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="editor/:projectId"
          element={
            <Suspense fallback={<div className="h-full bg-canvas" />}>
              <EditorPage />
            </Suspense>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  )
}
