import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DatasetStatus from '../data/DatasetStatus'
import SiteNav from './SiteNav'

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand__text">
            <h1 className="brand__name">WebInsight</h1>
            <p className="brand__tag">Public Web Intelligence</p>
          </div>
          <SiteNav />
        </div>
      </header>

      <DatasetStatus />

      <main className="app-main">
        <Suspense fallback={<p className="chart-empty">Memuat halaman…</p>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="app-footer">
        <p>
          <strong>WebInsight</strong> · Public Web Intelligence
        </p>
        <p>Insight disusun dari sumber publik dan dapat ditelusuri kembali ke evidence aslinya.</p>
        <p>Research automation dijalankan terpisah dari aplikasi web.</p>
      </footer>
    </div>
  )
}
