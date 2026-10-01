import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { validateDataset } from '../../contract/validate'
import type { ValidationResult } from '../../contract/validate'
import { useDataset } from '../../data/DatasetContext'

interface PendingImport {
  fileName: string
  parsed: unknown
  validation: ValidationResult
}

export default function ImportPanel() {
  const { origin, importDataset, restoreDefaultDataset } = useDataset()
  const [pending, setPending] = useState<PendingImport | null>(null)
  const [rejection, setRejection] = useState<string | null>(null)
  const [reading, setReading] = useState(false)

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return

    setReading(true)
    setRejection(null)
    setPending(null)

    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setReading(false)
      setRejection('File bukan JSON yang valid.')
      return
    }

    const validation = validateDataset(parsed)
    setReading(false)

    if (validation.dataset === null) {
      setRejection(validation.issues[0]?.message ?? 'File tidak sesuai kontrak data.')
      return
    }
    setPending({ fileName: file.name, parsed, validation })
  }

  const confirmImport = () => {
    if (pending === null) return
    const decision = importDataset(pending.parsed)
    if (decision.accepted) setPending(null)
  }

  return (
    <div className="import-panel">
      <label className="import-panel__picker">
        <span className="filter-bar__label">Pilih file .json hasil Hermes</span>
        <input
          className="input"
          type="file"
          accept=".json,application/json"
          onChange={(event) => void onFileChange(event)}
        />
      </label>
      <p className="import-panel__note">
        Dataset impor hanya digunakan pada sesi ini dan akan hilang setelah halaman dimuat ulang.
      </p>

      {reading ? <p className="import-panel__status">Membaca file…</p> : null}

      {rejection === null ? null : (
        <p className="notice notice--danger notice--inline">
          <strong>Dataset ditolak, dataset aktif tidak berubah.</strong> {rejection}
        </p>
      )}

      {pending === null ? null : (
        <div className="import-preview">
          <h4 className="import-preview__title">Preview: {pending.fileName}</h4>
          <div className="stat-grid">
            <div className="stat-box">
              <span className="stat-box__value">{pending.validation.stats.totalRecords}</span>
              <span className="stat-box__label">Total record</span>
            </div>
            <div className="stat-box">
              <span className="stat-box__value">{pending.validation.stats.validRecords}</span>
              <span className="stat-box__label">Valid</span>
            </div>
            <div className="stat-box">
              <span className="stat-box__value">{pending.validation.stats.invalidRecords}</span>
              <span className="stat-box__label">Invalid</span>
            </div>
            <div className="stat-box">
              <span className="stat-box__value">{pending.validation.stats.duplicateRecords}</span>
              <span className="stat-box__label">Duplikat</span>
            </div>
          </div>

          <h5 className="import-preview__subtitle">Contoh record valid (maks. 5)</h5>
          <ul className="import-preview__records">
            {pending.validation.records.slice(0, 5).map((record) => (
              <li key={record.id}>
                {record.title} <span className="import-preview__source">({record.source})</span>
              </li>
            ))}
          </ul>

          {pending.validation.issues.length === 0 ? null : (
            <>
              <h5 className="import-preview__subtitle">
                Catatan validasi (maks. 10 dari {pending.validation.issues.length})
              </h5>
              <ul className="issue-list">
                {pending.validation.issues.slice(0, 10).map((issue, index) => (
                  <li key={`${issue.recordIndex ?? 'dataset'}-${index}`}>{issue.message}</li>
                ))}
              </ul>
            </>
          )}

          <p className="import-preview__actions">
            <button type="button" className="btn btn--primary" onClick={confirmImport}>
              Gunakan Dataset
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setPending(null)}>
              Batal
            </button>
          </p>
        </div>
      )}

      {origin === 'imported' ? (
        <p className="import-panel__actions">
          <button type="button" className="btn btn--ghost" onClick={restoreDefaultDataset}>
            Pulihkan Dataset Bawaan
          </button>
        </p>
      ) : null}
    </div>
  )
}
