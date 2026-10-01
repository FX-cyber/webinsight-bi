import { describe, expect, it } from 'vitest'
import type { TrendSummary, TrendTopic } from '../contract/types'
import { makeRecord } from './testFixtures'
import { directionLabel, rankTrendTopics, recentSignalRecords, topTrendTopic } from './trendView'

const topic = (name: string, score: number): TrendTopic => ({
  topic: name,
  mentions: 5,
  sources: 3,
  recent_mentions: 2,
  trend_score: score,
  previous_trend_score: null,
  direction: 'flat',
  top_keywords: [],
})

const summaryWith = (topics: TrendTopic[]): TrendSummary => ({
  schema_version: '1.0',
  generated_at: '2026-10-01T10:00:00Z',
  window_hours: 48,
  recent_window_hours: 24,
  run: { id: 'r', mode: 'interactive', brief: 'b', sources_visited: 1, failures: [] },
  pipeline: { fetched: 1, duplicates_removed: 0, invalid_dropped: 0, final: 1 },
  topics,
  signals: [],
})

describe('rankTrendTopics', () => {
  it('mengurutkan skor menurun dan seri secara alfabetis', () => {
    const ranked = rankTrendTopics(summaryWith([topic('Zeta', 40), topic('Alpha', 40), topic('Mid', 90)]))
    expect(ranked.map((entry) => entry.topic)).toEqual(['Mid', 'Alpha', 'Zeta'])
  })

  it('mengembalikan array kosong bila summary null', () => {
    expect(rankTrendTopics(null)).toEqual([])
  })
})

describe('topTrendTopic', () => {
  it('mengambil skor tertinggi', () => {
    expect(topTrendTopic(summaryWith([topic('A', 10), topic('B', 77)]))?.topic).toBe('B')
  })

  it('null bila summary null', () => {
    expect(topTrendTopic(null)).toBeNull()
  })
})

describe('directionLabel', () => {
  it('memetakan arah ke teks eksplisit', () => {
    expect(directionLabel('up')).toBe('↑ Rising')
    expect(directionLabel('down')).toBe('↓ Falling')
    expect(directionLabel('flat')).toBe('→ Stable')
  })
})

describe('recentSignalRecords', () => {
  const records = [
    makeRecord({ id: '1', date: '2026-09-01' }),
    makeRecord({ id: '2', date: null }),
    makeRecord({ id: '3', date: '2026-09-20' }),
    makeRecord({ id: '4', date: '2026-09-10' }),
  ]

  it('mengurutkan tanggal menurun dengan record tanpa tanggal di akhir', () => {
    expect(recentSignalRecords(records, 4).map((record) => record.id)).toEqual([
      '3',
      '4',
      '1',
      '2',
    ])
  })

  it('menghormati limit dan input kosong', () => {
    expect(recentSignalRecords(records, 2)).toHaveLength(2)
    expect(recentSignalRecords([], 5)).toEqual([])
  })
})
