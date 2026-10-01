import { useState } from 'react'
import type { TrendSignal, WebRecord } from '../../contract/types'
import { formatDateId, formatNumberId } from '../../logic/format'

interface SignalCardProps {
  signal: TrendSignal
  relatedRecords: WebRecord[]
}

/**
 * Kartu signal. Badge cross-source/single-source diambil apa adanya dari
 * status data (P1), tidak dihitung ulang di UI.
 */
export default function SignalCard({ signal, relatedRecords }: SignalCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <article className="signal-card">
      <header className="signal-card__head">
        <span
          className={
            signal.status === 'cross-source' ? 'badge badge--success' : 'badge badge--warning'
          }
        >
          {signal.status === 'cross-source' ? 'cross-source' : 'single-source'}
        </span>
        <span className="signal-card__topic">{signal.topic}</span>
      </header>

      <h3 className="signal-card__title">{signal.title}</h3>

      <p className="signal-card__meta">
        {formatNumberId(signal.evidence_count)} evidence · {signal.sources.length} source
        {signal.entity === null ? '' : ` · ${signal.entity}`}
      </p>
      <p className="signal-card__sources">{signal.sources.join(' · ')}</p>

      <button
        type="button"
        className="btn btn--ghost signal-card__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {open ? 'Sembunyikan evidence' : `Lihat ${relatedRecords.length} record terkait`}
      </button>

      {open ? (
        <ul className="signal-card__records">
          {relatedRecords.length === 0 ? (
            <li className="facet__empty">record terkait tidak ditemukan pada dataset aktif</li>
          ) : (
            relatedRecords.map((record) => (
              <li key={record.id}>
                <a href={record.url} target="_blank" rel="noopener noreferrer">
                  {record.title}
                </a>
                <span className="signal-card__record-meta">
                  {record.source}
                  {record.date === null ? '' : ` · ${formatDateId(record.date)}`}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </article>
  )
}
