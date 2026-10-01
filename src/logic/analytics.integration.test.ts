import { describe, expect, it } from 'vitest'
import { validateDataset } from '../contract/validate'
import { buildKpiSummary } from './counts'
import { applyFiltersWithStats, EMPTY_FILTERS } from './filters'
import { aggregateSources } from './sources'
import { readPublicFixture } from './testFixtures'
import { buildTimeSeries } from './timeSeries'
import { topNByField } from './topN'

/**
 * Integrasi ringan terhadap dataset bawaan dengan invariant, bukan angka
 * sample yang rapuh: apa pun isi file sintetis nantinya, hubungan antar
 * hasil analitik harus tetap konsisten.
 */
describe('pipeline analytics pada public/data/web-data.json', () => {
  const validation = validateDataset(readPublicFixture('web-data.json'))
  const records = validation.records

  it('jumlah record sama dengan hasil normalisasi validator', () => {
    expect(validation.dataset).not.toBeNull()
    expect(records.length).toBeGreaterThan(0)
    expect(records.length).toBe(validation.stats.validRecords)
  })

  it('KPI konsisten dengan jumlah record terfilter', () => {
    const kpi = buildKpiSummary(records)
    expect(kpi.totalRecords).toBe(records.length)
    expect(kpi.uniqueSources).toBeGreaterThan(0)
    expect(kpi.uniqueEntities).toBeGreaterThanOrEqual(0)
    expect(kpi.uniqueTopics).toBeGreaterThan(0)
  })

  it('time series menjumlahkan tepat record bertanggal', () => {
    const series = buildTimeSeries(records)
    expect(series.points.length).toBeGreaterThan(0)
    const counted = series.points.reduce((total, point) => total + point.count, 0)
    expect(counted).toBe(records.length - series.excludedWithoutDate)
  })

  it('topN tiap dimensi berada dalam batas dan urut menurun', () => {
    for (const field of ['topic', 'category', 'entity'] as const) {
      const entries = topNByField(records, field)
      expect(entries.length).toBeGreaterThan(0)
      expect(entries.length).toBeLessThanOrEqual(10)
      const counts = entries.map((entry) => entry.count)
      expect([...counts].sort((a, b) => b - a)).toEqual(counts)
    }
  })

  it('agregasi source menjumlahkan tepat seluruh record', () => {
    const summaries = aggregateSources(records)
    expect(summaries.length).toBeGreaterThan(0)
    expect(summaries.reduce((total, summary) => total + summary.count, 0)).toBe(records.length)
  })

  it('filter facet selaras dengan hasil topN', () => {
    const topTopic = topNByField(records, 'topic')[0]
    expect(topTopic).toBeDefined()
    const filtered = applyFiltersWithStats(records, { ...EMPTY_FILTERS, topics: [topTopic!.label] })
    expect(filtered.stats.filteredRecords).toBe(topTopic!.count)
    expect(filtered.stats.totalRecords).toBe(records.length)
  })
})
