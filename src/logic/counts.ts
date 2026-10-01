import type { WebRecord } from '../contract/types'
import { groupByLabel } from './grouping'

export interface KpiSummary {
  totalRecords: number
  uniqueSources: number
  uniqueEntities: number
  uniqueTopics: number
}

/** Jumlah nilai unik non-null, case-insensitive. */
export function uniqueCount(values: (string | null)[]): number {
  return groupByLabel(values, (value) => value).length
}

/**
 * Ringkasan KPI murni angka. Keputusan tampilan (mis. menampilkan "—" saat 0)
 * adalah tanggung jawab UI, bukan fungsi ini.
 */
export function buildKpiSummary(records: WebRecord[]): KpiSummary {
  return {
    totalRecords: records.length,
    uniqueSources: uniqueCount(records.map((record) => record.source)),
    uniqueEntities: uniqueCount(records.map((record) => record.entity)),
    uniqueTopics: uniqueCount(records.map((record) => record.topic)),
  }
}
