import { useDataset } from '../../data/DatasetContext'
import { formatDateTimeId } from '../../logic/format'

/**
 * Strip informasi dataset aktif di header. Sengaja ringkas: rincian issue
 * lengkap baru ditampilkan pada halaman Import (T8).
 */
export default function DatasetStatus() {
  const { status, activeDataset, records, origin, stats, trendSummary } = useDataset()

  if (status === 'loading') {
    return (
      <div className="dataset-bar">
        <span className="dataset-bar__text">Memuat dataset bawaan…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="dataset-bar">
        <span className="badge badge--danger">Dataset gagal dimuat</span>
        <span className="dataset-bar__text">
          Metadata tidak ditampilkan; gunakan tombol muat ulang pada halaman.
        </span>
      </div>
    )
  }

  const metadata = activeDataset?.metadata ?? null
  const ignoredRecords = (stats?.invalidRecords ?? 0) + (stats?.duplicateRecords ?? 0)

  return (
    <div className="dataset-bar">
      <span className="badge">{origin === 'bundled' ? 'Dataset bawaan' : 'Dataset impor'}</span>
      <span className="dataset-bar__item">
        <span className="dataset-bar__label">Kueri</span>
        {metadata?.query ?? '—'}
      </span>
      <span className="dataset-bar__item">
        <span className="dataset-bar__label">Dibuat</span>
        {formatDateTimeId(metadata?.generated_at ?? null)}
      </span>
      <span className="dataset-bar__item">
        <span className="dataset-bar__label">Record aktif</span>
        {records.length}
      </span>
      {trendSummary === null ? null : (
        <span className="dataset-bar__item">
          <span className="dataset-bar__label">Run tren</span>
          {formatDateTimeId(trendSummary.generated_at)} · {trendSummary.run.mode}
        </span>
      )}
      {trendSummary !== null && trendSummary.run.failures.length > 0 ? (
        <span className="badge badge--warning">{trendSummary.run.failures.length} sumber gagal</span>
      ) : null}
      {ignoredRecords > 0 ? (
        <span className="badge badge--warning">{ignoredRecords} record diabaikan</span>
      ) : null}
      {stats?.metadataRecordCountMismatch ? (
        <span className="badge badge--warning">record_count tidak cocok</span>
      ) : null}
    </div>
  )
}
