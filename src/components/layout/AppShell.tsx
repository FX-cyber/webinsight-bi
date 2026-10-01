import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DatasetStatus from '../data/DatasetStatus'
import SiteNav from './SiteNav'

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              WB
            </span>
            <div className="brand__text">
              <h1 className="brand__name">WebInsight BI</h1>
              <p className="brand__tag">Public Web Intelligence Dashboard</p>
            </div>
          </div>
          <SiteNav />
        </div>
      </header>

      <div className="dataset-strip">
        <DatasetStatus />
      </div>

      <main className="app-main">
        <Suspense fallback={<p className="chart-empty">Memuat halaman…</p>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="app-footer">
        <p>
          Aplikasi 100% statis · seluruh pemrosesan berjalan di browser · tanpa backend, database,
          atau API key.
        </p>
        <p>
          Data bawaan adalah <strong>data sintetis</strong> untuk keperluan pengujian dan pendidikan,
          bukan fakta atau artikel nyata.
        </p>
      </footer>
    </div>
  )
}
