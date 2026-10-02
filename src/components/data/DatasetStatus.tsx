import { useDataset } from '../../data/DatasetContext'
import { uniqueCount } from '../../logic/counts'
import { formatDateId } from '../../logic/format'

/**
 * Coverage bar ringkas pengganti strip metadata teknis: hanya cakupan data dan
 * peringatan kecil bila ada sumber yang gagal diperiksa.
 */
export default function DatasetStatus() {
  const { status, activeDataset, records, trendSummary } = useDataset()

  if (status === 'loading') {
    return (
      <div className="coverage-strip">
        <p className="coverage-bar">Memuat data…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="coverage-strip">
        <p className="coverage-bar">
          <span className="coverage-bar__text--error">Data tidak dapat dimuat.</span>
        </p>
      </div>
    )
  }

  const metadata = activeDataset?.metadata ?? null
  const sourceCount = uniqueCount(records.map((record) => record.source))
  const topicCount = trendSummary?.topics.length ?? uniqueCount(records.map((record) => record.topic))
  const failures = trendSummary?.run.failures.length ?? 0

  return (
    <div className="coverage-strip">
      <p className="coverage-bar">
        <span>Updated {metadata ? formatDateId(metadata.generated_at.slice(0, 10)) : '—'}</span>
        <span className="coverage-bar__sep">{records.length} records</span>
        <span className="coverage-bar__sep">{sourceCount} sources</span>
        <span className="coverage-bar__sep">{topicCount} trends</span>
        {failures > 0 ? (
          <span className="coverage-bar__sep coverage-bar__warn">
            {failures} source checks unavailable
          </span>
        ) : null}
      </p>
    </div>
  )
}
