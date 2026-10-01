import type { TrendDirection, TrendSummary, TrendTopic, WebRecord } from '../contract/types'
import { sortRecords } from './sorting'

/** Peringkat topic berdasarkan trend_score menurun; seri diurut alfabetis. */
export function rankTrendTopics(summary: TrendSummary | null): TrendTopic[] {
  if (summary === null) return []
  return [...summary.topics].sort((a, b) => {
    if (a.trend_score !== b.trend_score) return b.trend_score - a.trend_score
    return a.topic < b.topic ? -1 : a.topic > b.topic ? 1 : 0
  })
}

export function topTrendTopic(summary: TrendSummary | null): TrendTopic | null {
  return rankTrendTopics(summary)[0] ?? null
}

/** Label arah yang eksplisit (teks + panah), bukan hanya warna. */
export function directionLabel(direction: TrendDirection): string {
  if (direction === 'up') return '↑ Rising'
  if (direction === 'down') return '↓ Falling'
  return '→ Stable'
}

/**
 * Fallback Signals bila signal grouping belum tersedia: record terbaru
 * (tanggal menurun, tanpa tanggal di akhir). Tidak mengklaim verifikasi apa pun.
 */
export function recentSignalRecords(records: WebRecord[], limit: number): WebRecord[] {
  return sortRecords(records, { field: 'date', direction: 'desc' }).slice(0, limit)
}
