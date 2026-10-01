import { Link } from 'react-router-dom'
import TimeSeriesChart from '../components/charts/TimeSeriesChart'
import TopNBarChart from '../components/charts/TopNBarChart'
import PageNotice from '../components/common/PageNotice'
import FilterBar from '../components/filters/FilterBar'
import AgentActivityPanel from '../components/trend/AgentActivityPanel'
import TrendHero from '../components/trend/TrendHero'
import TrendRanking from '../components/trend/TrendRanking'
import { useDataset } from '../data/DatasetContext'
import { useFilters } from '../data/FilterContext'
import { formatNumberId } from '../logic/format'
import { topNByField } from '../logic/topN'
import { rankTrendTopics, topTrendTopic } from '../logic/trendView'

export default function PulsePage() {
  const { status, retryDefaultDataset, trendSummary } = useDataset()
  const { filteredRecords } = useFilters()

  if (status === 'loading') {
    return <PageNotice tone="info" title="Memuat dataset bawaan…" />
  }

  if (status === 'error') {
    return (
      <PageNotice tone="danger" title="Dataset tidak dapat dimuat">
        <p>
          Periksa file <code>data/web-data.json</code> atau muat dataset lewat halaman Data.
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

  const ranking = rankTrendTopics(trendSummary)
  const top = topTrendTopic(trendSummary)
  const fallbackTopics = topNByField(filteredRecords, 'topic')

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Pulse</h2>
        <p className="page__lead">
          Pantauan tren dari sumber publik yang dipantau. Skor, arah, dan signal berasal dari run
          tren terakhir; aktivitas mention dihitung dari record terfilter.
        </p>
      </header>

      {top === null ? (
        <p className="notice notice--inline">
          Trend intelligence belum tersedia. Pulse tetap menampilkan aktivitas record yang dimuat.
        </p>
      ) : (
        <TrendHero topic={top} />
      )}

      <div className="pulse-grid">
        {ranking.length === 0 ? (
          <section className="card trend-ranking">
            <h3 className="card__title">Top Topics (dari record aktif)</h3>
            <ol className="trend-ranking__list">
              {fallbackTopics.map((entry, index) => (
                <li className="trend-ranking__item" key={entry.label}>
                  <span className="trend-ranking__rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="trend-ranking__body">
                    <span className="trend-ranking__topic">{entry.label}</span>
                    <span className="trend-ranking__meta">{formatNumberId(entry.count)} record</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <TrendRanking topics={ranking} />
        )}
        <AgentActivityPanel title="Agent Activity" />
      </div>

      <FilterBar />

      <div className="chart-grid">
        <div className="chart-grid__wide">
          <TimeSeriesChart records={filteredRecords} title="Mentions Over Time" />
        </div>
        <TopNBarChart
          title="Top Topics"
          field="topic"
          color="var(--chart-2)"
          records={filteredRecords}
        />
        <TopNBarChart
          title="Most Active Entities"
          field="entity"
          color="var(--chart-4)"
          records={filteredRecords}
        />
      </div>
    </section>
  )
}
