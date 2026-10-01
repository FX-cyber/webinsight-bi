import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateDataset } from './validate'
import { parseTrendSummary } from './trend'

const readJson = (name: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../public/data/${name}`, import.meta.url)), 'utf8'))

const minimalTrend = () => ({
  schema_version: '1.0',
  generated_at: '2026-10-01T10:00:00Z',
  window_hours: 48,
  recent_window_hours: 24,
  run: { id: 'r-1', mode: 'interactive', brief: 'brief uji', sources_visited: 2, failures: [] },
  pipeline: { fetched: 5, duplicates_removed: 1, invalid_dropped: 1, final: 3 },
  topics: [
    {
      topic: 'Topik A',
      mentions: 3,
      sources: 2,
      recent_mentions: 1,
      trend_score: 50,
      previous_trend_score: null,
      direction: 'flat',
      top_keywords: ['kata'],
    },
  ],
  signals: [
    {
      id: 's-1',
      title: 'Signal uji',
      topic: 'Topik A',
      entity: null,
      record_ids: ['r-1'],
      sources: ['a.test'],
      evidence_count: 1,
      status: 'single-source',
    },
  ],
})

describe('parseTrendSummary', () => {
  it('menerima bentuk minimal yang valid', () => {
    const parsed = parseTrendSummary(minimalTrend())
    expect(parsed).not.toBeNull()
    expect(parsed?.topics).toHaveLength(1)
    expect(parsed?.signals[0]?.status).toBe('single-source')
  })

  it.each([null, undefined, 'teks', 42, [], {}])('menolak input %s', (input) => {
    expect(parseTrendSummary(input)).toBeNull()
  })

  it('menolak schema_version mayor selain 1', () => {
    expect(parseTrendSummary({ ...minimalTrend(), schema_version: '2.0' })).toBeNull()
  })

  it('menolak topics yang bukan array', () => {
    expect(parseTrendSummary({ ...minimalTrend(), topics: {} })).toBeNull()
  })

  it('menolak trend_score di luar 0-100', () => {
    const broken = minimalTrend()
    broken.topics[0].trend_score = 150
    expect(parseTrendSummary(broken)).toBeNull()
  })

  it('menolak direction di luar up/down/flat', () => {
    const broken = minimalTrend()
    broken.topics[0].direction = 'sideways'
    expect(parseTrendSummary(broken)).toBeNull()
  })

  it('menolak status signal di luar cross-source/single-source', () => {
    const broken = minimalTrend()
    broken.signals[0].status = 'verified'
    expect(parseTrendSummary(broken)).toBeNull()
  })

  it('menolak mode run yang tidak dikenal', () => {
    const broken = minimalTrend()
    broken.run.mode = 'manual'
    expect(parseTrendSummary(broken)).toBeNull()
  })
})

describe('sample public/data/trend-summary.json', () => {
  const summary = parseTrendSummary(readJson('trend-summary.json'))
  const records = validateDataset(readJson('web-data.json')).records
  const sourceOf = new Map(records.map((record) => [record.id, record.source]))

  it('lolos parse', () => {
    expect(summary).not.toBeNull()
  })

  it('trend score berada pada rentang 0-100 dan direction valid', () => {
    expect(summary?.topics.length).toBeGreaterThan(0)
    for (const topic of summary?.topics ?? []) {
      expect(topic.trend_score).toBeGreaterThanOrEqual(0)
      expect(topic.trend_score).toBeLessThanOrEqual(100)
      expect(['up', 'down', 'flat']).toContain(topic.direction)
    }
  })

  it('evidence_count konsisten dengan record_ids dan sources unik', () => {
    for (const signal of summary?.signals ?? []) {
      expect(signal.evidence_count).toBe(signal.record_ids.length)
      expect(new Set(signal.sources).size).toBe(signal.sources.length)
    }
  })

  it('cross-source hanya untuk signal dengan >= 2 source berbeda', () => {
    const signals = summary?.signals ?? []
    expect(signals.length).toBeGreaterThan(0)
    for (const signal of signals) {
      const expected = signal.sources.length >= 2 ? 'cross-source' : 'single-source'
      expect(signal.status).toBe(expected)
    }
  })

  it('sources signal cocok dengan source record pendukungnya di web-data.json', () => {
    for (const signal of summary?.signals ?? []) {
      const actual = new Set(signal.record_ids.map((id) => sourceOf.get(id)).filter(Boolean))
      expect([...actual].sort()).toEqual([...signal.sources].sort())
    }
  })
})
