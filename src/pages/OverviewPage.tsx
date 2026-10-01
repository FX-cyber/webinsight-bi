import { Link } from 'react-router-dom'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TopNBarChart from '../components/charts/TopNBarChart'
import PageNotice from '../components/common/PageNotice'
import FilterBar from '../components/filters/FilterBar'
import KpiGrid from '../components/kpi/KpiGrid'
import { useDataset } from '../data/DatasetContext'
import { useFilters } from '../data/FilterContext'

export default function OverviewPage() {
  const { status, retryDefaultDataset } = useDataset()
  const { filteredRecords } = useFilters()

  if (status === 'loading') {
    return <PageNotice tone="info" title="Memuat dataset bawaan…" />
  }

  if (status === 'error') {
    return (
      <PageNotice tone="danger" title="Dataset tidak dapat dimuat">
        <p>
          Periksa file <code>data/web-data.json</code> atau muat dataset lewat halaman Schema /
          Import.
        </p>
        <p className="notice__actions">
          <button type="button" className="btn btn--primary" onClick={retryDefaultDataset}>
            Muat ulang dataset bawaan
          </button>
          <Link className="btn btn--ghost" to="/data">
            Import dataset manual
          </Link>
        </p>
      </PageNotice>
    )
  }

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Overview</h2>
        <p className="page__lead">
          Ringkasan dataset hasil ekstraksi Hermes. Seluruh angka adalah hitungan jumlah record
          setelah filter diterapkan.
        </p>
      </header>

      <FilterBar />
      <KpiGrid records={filteredRecords} />

      <div className="chart-grid">
        <div className="chart-grid__wide">
          <TimeSeriesChart records={filteredRecords} />
        </div>
        <TopNBarChart title="Top Topics" field="topic" color="var(--chart-2)" records={filteredRecords} />
        <TopNBarChart
          title="Top Categories"
          field="category"
          color="var(--chart-3)"
          records={filteredRecords}
        />
        <div className="chart-grid__wide">
          <TopNBarChart
            title="Most Active Entities"
            field="entity"
            color="var(--chart-4)"
            records={filteredRecords}
          />
        </div>
      </div>
    </section>
  )
}
