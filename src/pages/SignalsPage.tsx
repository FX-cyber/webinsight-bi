import { useMemo } from 'react'
import SignalCard from '../components/signals/SignalCard'
import type { WebRecord } from '../contract/types'
import { useDataset } from '../data/DatasetContext'
import { formatDateId } from '../logic/format'
import { recentSignalRecords } from '../logic/trendView'

export default function SignalsPage() {
  const { trendSummary, records } = useDataset()
  const signals = trendSummary?.signals ?? []
  const recordById = useMemo(() => new Map(records.map((record) => [record.id, record])), [records])
  const recent = useMemo(() => recentSignalRecords(records, 8), [records])

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Signals</h2>
        <p className="page__lead">
          Klaim yang ditemukan beserta evidence-nya. Badge cross-source hanya muncul bila record
          pendukung berasal dari minimal dua sumber berbeda.
        </p>
      </header>

      {signals.length === 0 ? (
        <>
          <p className="notice notice--inline">
            Signal grouping belum tersedia pada run terakhir. Berikut Recent Signals berupa record
            terbaru — bukan klaim terverifikasi lintas sumber.
          </p>
          <div className="signal-list">
            {recent.map((record) => (
              <article className="signal-card" key={record.id}>
                <header className="signal-card__head">
                  <span className="badge">recent</span>
                  <span className="signal-card__topic">{record.topic ?? 'tanpa topik'}</span>
                </header>
                <h3 className="signal-card__title">{record.title}</h3>
                <p className="signal-card__meta">
                  {record.source}
                  {record.date === null ? '' : ` · ${formatDateId(record.date)}`}
                </p>
                <p className="signal-card__sources">
                  <a href={record.url} target="_blank" rel="noopener noreferrer">
                    Buka sumber asli
                  </a>
                </p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="signal-list">
          {signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              relatedRecords={signal.record_ids
                .map((id) => recordById.get(id))
                .filter((record): record is WebRecord => record !== undefined)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
