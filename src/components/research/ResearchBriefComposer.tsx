import { useState } from 'react'
import { briefFileName, buildResearchBrief } from '../../logic/brief'
import type { SourcePreference } from '../../logic/brief'
import { SOURCE_PREFERENCE_LABELS } from '../../logic/brief'

const WINDOW_OPTIONS = [24, 48, 72, 168]

/**
 * Brief composer: menyusun brief self-contained untuk dijalankan manual di
 * sesi Qoder agent. Tidak ada backend, tidak ada network request, dan tidak
 * ada tombol yang mengklaim menjalankan agent.
 */
export default function ResearchBriefComposer() {
  const [query, setQuery] = useState('')
  const [topicScope, setTopicScope] = useState('')
  const [windowHours, setWindowHours] = useState(48)
  const [sourcePreference, setSourcePreference] = useState<SourcePreference>('mixed')
  const [brief, setBrief] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const prepare = () => {
    setBrief(
      buildResearchBrief({
        query,
        topicScope,
        windowHours,
        sourcePreference,
        generatedAt: new Date().toISOString(),
      }),
    )
    setCopied(false)
  }

  const copy = async () => {
    if (brief === null) return
    await navigator.clipboard.writeText(brief)
    setCopied(true)
  }

  const download = () => {
    if (brief === null) return
    const blob = new Blob([brief], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = briefFileName(query)
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="card brief-composer">
      <h3 className="card__title">Prepare Research Brief</h3>
      <p className="card__note">
        Halaman ini hanya menyusun brief. Brief dijalankan manual dengan menempelkannya ke sesi
        Qoder agent; tidak ada agent yang dijalankan dari browser.
      </p>

      <div className="brief-composer__grid">
        <label className="brief-composer__field brief-composer__field--wide">
          <span className="filter-bar__label">Research Query</span>
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="mis. adopsi AI di sektor pendidikan Indonesia"
          />
        </label>
        <label className="brief-composer__field">
          <span className="filter-bar__label">Topic Scope</span>
          <input
            className="input"
            value={topicScope}
            onChange={(event) => setTopicScope(event.target.value)}
            placeholder="kosongkan untuk topic-agnostic"
          />
        </label>
        <label className="brief-composer__field">
          <span className="filter-bar__label">Time Window</span>
          <select
            className="input"
            value={windowHours}
            onChange={(event) => setWindowHours(Number(event.target.value))}
          >
            {WINDOW_OPTIONS.map((hours) => (
              <option key={hours} value={hours}>
                {hours} jam
              </option>
            ))}
          </select>
        </label>
        <label className="brief-composer__field">
          <span className="filter-bar__label">Source Preference</span>
          <select
            className="input"
            value={sourcePreference}
            onChange={(event) => setSourcePreference(event.target.value as SourcePreference)}
          >
            {(Object.keys(SOURCE_PREFERENCE_LABELS) as SourcePreference[]).map((key) => (
              <option key={key} value={key}>
                {SOURCE_PREFERENCE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="brief-composer__actions">
        <button type="button" className="btn btn--primary" onClick={prepare}>
          Prepare Research Brief
        </button>
      </p>

      {brief === null ? null : (
        <div className="brief-composer__output">
          <pre className="code-block">
            <code>{brief}</code>
          </pre>
          <p className="brief-composer__actions">
            <button type="button" className="btn btn--ghost" onClick={() => void copy()}>
              {copied ? 'Brief tersalin' : 'Copy Agent Brief'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={download}>
              Download Brief (.md)
            </button>
          </p>
        </div>
      )}
    </section>
  )
}
