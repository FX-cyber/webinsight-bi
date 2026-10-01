import type { WebRecord } from '../contract/types'
import { groupKey, matchesLabel } from './grouping'

export interface DataFilters {
  search: string
  dateFrom: string | null
  dateTo: string | null
  topics: string[]
  categories: string[]
  sources: string[]
}

export const EMPTY_FILTERS: DataFilters = {
  search: '',
  dateFrom: null,
  dateTo: null,
  topics: [],
  categories: [],
  sources: [],
}

export interface FilterStats {
  totalRecords: number
  filteredRecords: number
  /** Record ber-date null yang disembunyikan karena filter tanggal aktif. */
  hiddenWithoutDate: number
}

export interface FilterResult {
  records: WebRecord[]
  stats: FilterStats
}

const SEARCH_FIELDS = ['title', 'summary', 'entity', 'source', 'category', 'topic'] as const

function matchesSearch(record: WebRecord, query: string): boolean {
  return SEARCH_FIELDS.some((field) => {
    const value = record[field]
    return value !== null && value.toLowerCase().includes(query)
  })
}

function matchesDateRange(record: WebRecord, dateFrom: string | null, dateTo: string | null): boolean {
  if (dateFrom === null && dateTo === null) return true
  if (record.date === null) return false
  if (dateFrom !== null && record.date < dateFrom) return false
  if (dateTo !== null && record.date > dateTo) return false
  return true
}

function matchesFacet(selected: string[], value: string | null): boolean {
  if (selected.length === 0) return true
  return selected.some((option) => matchesLabel(option, value))
}

/**
 * AND antar facet, OR di dalam satu facet. Tidak memutasi input;
 * mengembalikan array baru.
 */
export function applyFilters(records: WebRecord[], filters: DataFilters): WebRecord[] {
  const query = groupKey(filters.search)

  return records.filter((record) => {
    if (query !== '' && !matchesSearch(record, query)) return false
    if (!matchesDateRange(record, filters.dateFrom, filters.dateTo)) return false
    if (!matchesFacet(filters.topics, record.topic)) return false
    if (!matchesFacet(filters.categories, record.category)) return false
    if (!matchesFacet(filters.sources, record.source)) return false
    return true
  })
}

export function applyFiltersWithStats(records: WebRecord[], filters: DataFilters): FilterResult {
  const filtered = applyFilters(records, filters)
  const dateFilterActive = filters.dateFrom !== null || filters.dateTo !== null
  const hiddenWithoutDate = dateFilterActive
    ? records.filter((record) => record.date === null).length
    : 0

  return {
    records: filtered,
    stats: {
      totalRecords: records.length,
      filteredRecords: filtered.length,
      hiddenWithoutDate,
    },
  }
}
