import { lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { FilterProvider } from './data/FilterContext'
import DataPage from './pages/DataPage'
import ExplorePage from './pages/ExplorePage'
import SignalsPage from './pages/SignalsPage'
import SourcesPage from './pages/SourcesPage'

// Satu-satunya halaman yang memakai Recharts; dipisah agar chunk awal tetap kecil.
const PulsePage = lazy(() => import('./pages/PulsePage'))

export default function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<PulsePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="sources" element={<SourcesPage />} />
            {/* Utility route: tidak tampil di navigasi utama. */}
            <Route path="data" element={<DataPage />} />
            <Route path="research" element={<Navigate to="/explore" replace />} />
            <Route path="explorer" element={<Navigate to="/explore" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </FilterProvider>
    </HashRouter>
  )
}
