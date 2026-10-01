import { describe, expect, it } from 'vitest'
import { makeRecord } from './testFixtures'
import { buildTimeSeries } from './timeSeries'

describe('buildTimeSeries', () => {
  it('rentang <= 120 hari memakai granularity daily', () => {
    const records = [
      makeRecord({ date: '2026-06-01' }),
      makeRecord({ date: '2026-06-01' }),
      makeRecord({ date: '2026-09-28' }),
    ]
    const series = buildTimeSeries(records)
    expect(series.granularity).toBe('daily')
    expect(series.points).toEqual([
      { period: '2026-06-01', count: 2 },
      { period: '2026-09-28', count: 1 },
    ])
  })

  it('rentang > 120 hari memakai granularity monthly', () => {
    const records = [
      makeRecord({ date: '2026-01-05' }),
      makeRecord({ date: '2026-01-20' }),
      makeRecord({ date: '2026-06-10' }),
    ]
    const series = buildTimeSeries(records)
    expect(series.granularity).toBe('monthly')
    expect(series.points).toEqual([
      { period: '2026-01', count: 2 },
      { period: '2026-06', count: 1 },
    ])
  })

  it('tanpa record bertanggal menghasilkan points kosong', () => {
    const series = buildTimeSeries([makeRecord({ date: null }), makeRecord({ date: null })])
    expect(series.points).toEqual([])
    expect(series.excludedWithoutDate).toBe(2)
  })

  it('satu tanggal menghasilkan satu point', () => {
    const series = buildTimeSeries([makeRecord({ date: '2026-07-07' }), makeRecord({ date: '2026-07-07' })])
    expect(series.points).toEqual([{ period: '2026-07-07', count: 2 }])
  })

  it('mengurutkan period kronologis walau input acak', () => {
    const records = [
      makeRecord({ date: '2026-08-15' }),
      makeRecord({ date: '2026-06-02' }),
      makeRecord({ date: '2026-07-20' }),
    ]
    expect(buildTimeSeries(records).points.map((point) => point.period)).toEqual([
      '2026-06-02',
      '2026-07-20',
      '2026-08-15',
    ])
  })

  it('melaporkan excludedWithoutDate dengan benar', () => {
    const records = [makeRecord({ date: '2026-08-01' }), makeRecord({ date: null })]
    expect(buildTimeSeries(records).excludedWithoutDate).toBe(1)
  })
})
