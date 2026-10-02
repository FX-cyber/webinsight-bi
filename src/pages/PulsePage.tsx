import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import PageNotice from '../components/common/PageNotice'
import TrendHero from '../components/trend/TrendHero'
import TrendRanking from '../components/trend/TrendRanking'
import { useDataset } from '../data/DatasetContext'
import { useFilters } from '../data/FilterContext'
import { uniqueCount } from '../logic/counts'
import { formatDateId } from '../logic/format'
import { rankTrendTopics, topTrendTopic } from '../logic/trendView'

const KEY_SIGNAL_LIMIT = 5

export default function PulsePage() {
  const { status, retryDefaultDataset, records, trendSummary } = useDataset()
  const { filteredRecords } = useFilters()

  const ranking = useMemo(() => rankTrendTopics(trendSummary), [trendSummary])
  const top = useMemo(() => topTrendTopic(trendSummary), [trendSummary])

  const topCategory = useMemo(() => {
    if (top === null) return null
    const counts = new Map<string, number>()
    for (const record of records) {
      if (record.topic !== top.topic || record.category === null) continue
      counts.set(record.category, (counts.get(record.category) ?? 0) + 1)
    }
    let best: string | null = null
    let bestCount = 0
    for (const [category, count] of counts) {
      if (count > bestCount) {
        best = category
        bestCount = count
      }
    }
    return best
  }, [records, top])

  const keySignals = useMemo(() => {
    const signals = trendSummary?.signals ?? []
    return [...signals]
      .sort((a, b) => b.evidence_count - a.evidence_count || (a.title < b.title ? -1 : 1))
      .slice(0, KEY_SIGNAL_LIMIT)
  }, [trendSummary])

  if (status === 'loading') {
    return <PageNotice tone="info" title="Memuat data…" />
  }

  if (status === 'error') {
    return (
      <PageNotice tone="danger" title="Data tidak dapat dimuat">
        <p>
          Periksa file <code>data/web-data.json</code> atau muat dataset lewat route utility{' '}
          <code>#/data</code>.
        </p>
        <p className="notice__actions">
          <button type="button" className="btn btn--primary" onClick={retryDefaultDataset}>
            Muat ulang data
          </button>
          <Link className="btn btn--ghost" to="/data">
            Import dataset manual
          </Link>
        </p>
      </PageNotice>
    )
  }

  const sourceCount = uniqueCount(records.map((record) => record.source))
  const topicCount = trendSummary?.topics.length ?? uniqueCount(records.map((record) => record.topic))
  const updated = trendSummary?.generated_at ?? null

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Pulse</h2>
        <p className="page__lead">Perkembangan yang paling menonjol dari sumber publik terbaru.</p>
      </header>

      {top === null ? (
        <p className="notice notice--inline">
          Trend intelligence belum tersedia pada data yang dimuat.
        </p>
      ) : (
        <TrendHero topic={top} category={topCategory} />
      )}

      <TrendRanking topics={ranking} />

      <TimeSeriesChart records={filteredRecords} title="Mentions Over Time" />

      <section>
        <div className="chart-card__head">
          <h3 className="section-title">Key Signals</h3>
          <p className="section-subtitle">
            Klaim dengan evidence terkuat ·{' '}
            <Link to="/signals">lihat semua signal</Link>
          </p>
        </div>
        {keySignals.length === 0 ? (
          <p className="meta-line">Belum ada signal pada data yang dimuat.</p>
        ) : (
          <ul className="key-signals">
            {keySignals.map((signal) => (
              <li className="key-signals__item" key={signal.id}>
                <span
                  className={
                    signal.status === 'cross-source'
                      ? 'signal-card__status signal-card__status--cross'
                      : 'signal-card__status'
                  }
                >
                  {signal.status === 'cross-source' ? 'Cross-source' : 'Single-source'}
                </span>
                <span className="key-signals__title">
                  <Link to="/signals">{signal.title}</Link>
                </span>
                <span className="meta-line">
                  {signal.evidence_count} evidence · {signal.sources.length} sources
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="meta-line">
        {records.length} records · {sourceCount} sources · {topicCount} topics · Updated{' '}
        {updated === null ? '—' : formatDateId(updated.slice(0, 10))}
      </p>
    </section>
  )
}
