import { useState } from 'react'
import type { TrendSignal, WebRecord } from '../../contract/types'
import { formatDateId, formatNumberId } from '../../logic/format'

interface SignalCardProps {
  signal: TrendSignal
  relatedRecords: WebRecord[]
}

/**
 * Kartu signal editorial. Status cross-source/single-source ditampilkan sebagai
 * label kecil berbasis data (P1), bukan badge warna mencolok.
 */
export default function SignalCard({ signal, relatedRecords }: SignalCardProps) {
  const [open, setOpen] = useState(false)
  const crossSource = signal.status === 'cross-source'

  return (
    <article className="signal-card">
      <header className="signal-card__head">
        <span
          className={crossSource ? 'signal-card__status signal-card__status--cross' : 'signal-card__status'}
        >
          {crossSource ? 'Cross-source' : 'Single-source'} · {signal.sources.length} source
          {signal.sources.length === 1 ? '' : 's'}
        </span>
        <span className="signal-card__topic">{signal.topic}</span>
      </header>

      <h3 className="signal-card__title">{signal.title}</h3>

      <p className="signal-card__meta">
        {formatNumberId(signal.evidence_count)} evidence
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
            <li className="meta-line">record terkait tidak ditemukan pada dataset aktif</li>
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
