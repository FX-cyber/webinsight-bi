import type { WebRecord } from '../contract/types'

export type TimeGranularity = 'daily' | 'monthly'

export interface TimeSeriesPoint {
  /** "YYYY-MM-DD" untuk daily, "YYYY-MM" untuk monthly. */
  period: string
  count: number
}

export interface TimeSeries {
  granularity: TimeGranularity
  points: TimeSeriesPoint[]
  excludedWithoutDate: number
}

export const MONTHLY_THRESHOLD_DAYS = 120

const MS_PER_DAY = 86_400_000

/** Parse komponen tanggal eksplisit agar tidak bergantung timezone browser. */
function toUtcDayMs(isoDate: string): number {
  const year = Number(isoDate.slice(0, 4))
  const month = Number(isoDate.slice(5, 7))
  const day = Number(isoDate.slice(8, 10))
  return Date.UTC(year, month - 1, day)
}

/**
 * Hanya periode yang memiliki record yang dikembalikan (tanpa bucket kosong),
 * urut kronologis menaik. Record tanpa tanggal tidak ikut dihitung sebagai point
 * tetapi dilaporkan lewat excludedWithoutDate.
 */
export function buildTimeSeries(records: WebRecord[]): TimeSeries {
  const dated = records.filter((record): record is WebRecord & { date: string } => record.date !== null)
  const excludedWithoutDate = records.length - dated.length

  if (dated.length === 0) {
    return { granularity: 'daily', points: [], excludedWithoutDate }
  }

  let minDate = dated[0].date
  let maxDate = dated[0].date
  for (const record of dated) {
    if (record.date < minDate) minDate = record.date
    if (record.date > maxDate) maxDate = record.date
  }

  const spanDays = (toUtcDayMs(maxDate) - toUtcDayMs(minDate)) / MS_PER_DAY
  const granularity: TimeGranularity = spanDays > MONTHLY_THRESHOLD_DAYS ? 'monthly' : 'daily'

  const counts = new Map<string, number>()
  for (const record of dated) {
    const period = granularity === 'daily' ? record.date : record.date.slice(0, 7)
    counts.set(period, (counts.get(period) ?? 0) + 1)
  }

  const points = [...counts.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => (a.period === b.period ? 0 : a.period < b.period ? -1 : 1))

  return { granularity, points, excludedWithoutDate }
}
