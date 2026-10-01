import { describe, expect, it } from 'vitest'
import { validateDataset } from '../contract/validate'
import { buildKpiSummary } from './counts'
import { applyFiltersWithStats, EMPTY_FILTERS } from './filters'
import { aggregateSources } from './sources'
import { readPublicFixture } from './testFixtures'
import { buildTimeSeries } from './timeSeries'
import { topNByField } from './topN'

/**
 * Integrasi ringan: memastikan seluruh pipeline analytics bekerja pada dataset
 * bawaan tanpa hard-code nilai sintetis selain jumlah record.
 */
describe('pipeline analytics pada public/data/web-data.json', () => {
  const validation = validateDataset(readPublicFixture('web-data.json'))
  const records = validation.records

  it('memuat 36 record valid', () => {
    expect(validation.dataset).not.toBeNull()
    expect(records).toHaveLength(36)
  })

  it('KPI dihitung tanpa error dan konsisten', () => {
    const kpi = buildKpiSummary(records)
    expect(kpi.totalRecords).toBe(36)
    expect(kpi.uniqueSources).toBeGreaterThan(0)
    expect(kpi.uniqueEntities).toBeGreaterThan(0)
    expect(kpi.uniqueTopics).toBeGreaterThan(0)
  })

  it('time series terbentuk dan jumlahnya konsisten dengan record bertanggal', () => {
    const series = buildTimeSeries(records)
    expect(series.points.length).toBeGreaterThan(0)
    const counted = series.points.reduce((total, point) => total + point.count, 0)
    expect(counted).toBe(records.length - series.excludedWithoutDate)
  })

  it('top topic, category, dan entity terbentuk', () => {
    for (const field of ['topic', 'category', 'entity'] as const) {
      const entries = topNByField(records, field)
      expect(entries.length).toBeGreaterThan(0)
      expect(entries.length).toBeLessThanOrEqual(10)
      expect(entries[0]?.count).toBeGreaterThan(0)
    }
  })

  it('agregasi source mencakup seluruh record', () => {
    const summaries = aggregateSources(records)
    expect(summaries.length).toBeGreaterThan(0)
    expect(summaries.reduce((total, summary) => total + summary.count, 0)).toBe(36)
  })

  it('filter facet selaras dengan hasil topN', () => {
    const topTopic = topNByField(records, 'topic')[0]
    expect(topTopic).toBeDefined()
    const filtered = applyFiltersWithStats(records, { ...EMPTY_FILTERS, topics: [topTopic!.label] })
    expect(filtered.stats.filteredRecords).toBe(topTopic!.count)
  })
})
