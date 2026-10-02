import RecordTable from '../components/explorer/RecordTable'
import FilterBar from '../components/filters/FilterBar'
import { useDataset } from '../data/DatasetContext'
import { useFilters } from '../data/FilterContext'
import { uniqueCount } from '../logic/counts'
import { formatDateId } from '../logic/format'

export default function ExplorePage() {
  const { filteredRecords } = useFilters()
  const { records, activeDataset, trendSummary } = useDataset()

  const metadata = activeDataset?.metadata ?? null
  const modeLabel =
    trendSummary?.run.mode === 'automated'
      ? 'Automated research'
      : trendSummary?.run.mode === 'interactive'
        ? 'Interactive research'
        : null

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Explore</h2>
        <p className="page__lead">
          Telusuri evidence, topik, sumber, dan artikel yang membentuk trend intelligence.
        </p>
        <p className="meta-line">
          {metadata ? `Updated ${formatDateId(metadata.generated_at.slice(0, 10))}` : 'Updated —'} ·{' '}
          {records.length} records · {uniqueCount(records.map((record) => record.source))} sources
          {modeLabel === null ? '' : ` · ${modeLabel}`}
        </p>
      </header>

      <FilterBar />
      <RecordTable records={filteredRecords} />
    </section>
  )
}
