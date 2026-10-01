import { useEffect } from 'react'
import type { WebRecord } from '../../contract/types'
import { formatDateId, formatDateTimeId } from '../../logic/format'

interface RecordDetailModalProps {
  record: WebRecord
  onClose: () => void
}

export default function RecordDetailModal({ record, onClose }: RecordDetailModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const fields: { label: string; value: string }[] = [
    { label: 'Tanggal', value: formatDateId(record.date) },
    { label: 'Source', value: record.source },
    { label: 'Entity', value: record.entity ?? '' },
    { label: 'Category', value: record.category ?? '' },
    { label: 'Topic', value: record.topic ?? '' },
    { label: 'Location', value: record.location ?? '' },
    { label: 'Diambil pada', value: formatDateTimeId(record.retrieved_at) },
  ].filter((field) => field.value !== '' && field.value !== '—')

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={record.title}>
        <div className="modal__head">
          <h3 className="modal__title">{record.title}</h3>
          <button type="button" className="btn btn--ghost" onClick={onClose} aria-label="Tutup detail">
            Tutup
          </button>
        </div>

        <dl className="detail-list">
          {fields.map((field) => (
            <div className="detail-list__row" key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>

        <p className="modal__summary">{record.summary}</p>

        <a
          className="btn btn--primary"
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buka sumber asli
        </a>
      </div>
    </div>
  )
}
