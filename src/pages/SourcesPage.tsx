import { useMemo } from 'react'
import { useDataset } from '../data/DatasetContext'
import { formatDateId } from '../logic/format'
import { aggregateSources } from '../logic/sources'

export default function SourcesPage() {
  const { records } = useDataset()
  const summaries = useMemo(() => aggregateSources(records), [records])

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Sources</h2>
        <p className="page__lead">
          Traceability: publisher yang membentuk intelligence ini beserta artikel aslinya.
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="chart-empty">Belum ada sumber pada data yang dimuat.</p>
      ) : (
        <div className="source-list">
          {summaries.map((summary) => (
            <details className="source-item" key={summary.source}>
              <summary>
                <span className="source-item__name">{summary.source}</span>
                <span className="source-item__meta">{summary.count} evidence</span>
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
      )}
    </section>
  )
}
