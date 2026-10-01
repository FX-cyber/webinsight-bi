import { lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { FilterProvider } from './data/FilterContext'
import DataPage from './pages/DataPage'
import ExplorerPage from './pages/ExplorerPage'
import SourcesPage from './pages/SourcesPage'

// Satu-satunya halaman yang memakai Recharts; dipisah agar chunk awal tetap kecil.
const OverviewPage = lazy(() => import('./pages/OverviewPage'))

export default function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="data" element={<DataPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </FilterProvider>
    </HashRouter>
  )
}
