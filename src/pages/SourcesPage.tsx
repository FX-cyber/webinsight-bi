import { useMemo } from 'react'
import PageNotice from '../components/common/PageNotice'
import FilterBar from '../components/filters/FilterBar'
import { useFilters } from '../data/FilterContext'
import { formatDateId } from '../logic/format'
import { aggregateSources } from '../logic/sources'

export default function SourcesPage() {
  const { filteredRecords } = useFilters()
  const summaries = useMemo(() => aggregateSources(filteredRecords), [filteredRecords])

  if (filteredRecords.length === 0) {
    return (
      <section className="page">
        <header className="page__head">
          <h2 className="page__title">Sources</h2>
        </header>
        <FilterBar />
        <PageNotice tone="info" title="Tidak ada sumber untuk ditampilkan pada filter saat ini." />
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Sources</h2>
        <p className="page__lead">
          Distribusi sumber publik dari {filteredRecords.length} record terfilter. Buka tiap sumber
          untuk melihat daftar artikel aslinya.
        </p>
      </header>

      <FilterBar />

      <div className="source-list">
        {summaries.map((summary) => (
          <details className="source-item" key={summary.source}>
            <summary>
              <span className="source-item__name">{summary.source}</span>
              <span className="badge">{summary.count} record</span>
              <span className="source-item__meta">
                {summary.latestDate === null
                  ? 'tanpa tanggal'
                  : `terbaru ${formatDateId(summary.latestDate)}`}
              </span>
              <span className="source-item__topics">
                {summary.topics.length === 0 ? 'tanpa topik' : summary.topics.join(' · ')}
              </span>
            </summary>
            <ul className="source-articles">
              {summary.records.map((record) => (
                <li key={record.id}>
                  <a href={record.url} target="_blank" rel="noopener noreferrer">
                    {record.title}
                  </a>
                  {record.date === null ? null : (
                    <span className="source-articles__date">{formatDateId(record.date)}</span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  )
}
