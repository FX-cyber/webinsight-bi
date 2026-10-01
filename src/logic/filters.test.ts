import { describe, expect, it } from 'vitest'
import type { DataFilters } from './filters'
import { applyFilters, applyFiltersWithStats, EMPTY_FILTERS } from './filters'
import { makeRecord } from './testFixtures'

const records = [
  makeRecord({
    id: '1',
    title: 'Panel Surya Kota Sampel',
    summary: 'uji coba energi terbarukan',
    topic: 'Teknologi Hijau',
    category: 'Berita',
    source: 'a.test',
    date: '2026-09-01',
  }),
  makeRecord({
    id: '2',
    title: 'Festival Kuliner Pesisir',
    summary: 'kunjungan pariwisata naik',
    topic: 'Pariwisata',
    category: 'Laporan',
    source: 'B.test',
    date: '2026-09-30',
  }),
  makeRecord({
    id: '3',
    title: 'Catatan Tanpa Tanggal',
    summary: 'catatan administratif',
    topic: 'Pariwisata',
    category: 'Berita',
    source: 'a.test',
    date: null,
  }),
]

const withFilters = (overrides: Partial<DataFilters>): DataFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
})

const idsOf = (filtered: typeof records) => filtered.map((record) => record.id)

describe('search', () => {
  it('mencari pada title', () => {
    expect(idsOf(applyFilters(records, withFilters({ search: 'panel' })))).toEqual(['1'])
  })

  it('mencari pada summary', () => {
    expect(idsOf(applyFilters(records, withFilters({ search: 'pariwisata naik' })))).toEqual(['2'])
  })

  it('mencari pada topic', () => {
    expect(idsOf(applyFilters(records, withFilters({ search: 'teknologi hijau' })))).toEqual(['1'])
  })

  it('case-insensitive', () => {
    expect(idsOf(applyFilters(records, withFilters({ search: 'PANEL SURYA' })))).toEqual(['1'])
  })

  it('query kosong tidak memfilter', () => {
    expect(applyFilters(records, withFilters({ search: '   ' }))).toHaveLength(3)
  })
})

describe('date filter', () => {
  it('dateFrom bersifat inclusive', () => {
    expect(idsOf(applyFilters(records, withFilters({ dateFrom: '2026-09-01' })))).toEqual(['1', '2'])
  })

  it('dateTo bersifat inclusive', () => {
    expect(idsOf(applyFilters(records, withFilters({ dateTo: '2026-09-01' })))).toEqual(['1'])
  })

  it('rentang bersifat inclusive di kedua ujung', () => {
    expect(
      idsOf(applyFilters(records, withFilters({ dateFrom: '2026-09-01', dateTo: '2026-09-30' }))),
    ).toEqual(['1', '2'])
  })

  it('record tanpa tanggal dikeluarkan saat filter tanggal aktif', () => {
    expect(idsOf(applyFilters(records, withFilters({ dateFrom: '2026-01-01' })))).toEqual(['1', '2'])
  })

  it('record tanpa tanggal tetap ada saat filter tanggal tidak aktif', () => {
    expect(idsOf(applyFilters(records, withFilters({})))).toEqual(['1', '2', '3'])
  })
})

describe('facet', () => {
  it('dua nilai dalam satu facet berarti OR', () => {
    expect(
      idsOf(applyFilters(records, withFilters({ topics: ['Teknologi Hijau', 'Pariwisata'] }))),
    ).toEqual(['1', '2', '3'])
  })

  it('antar facet berarti AND', () => {
    expect(
      idsOf(applyFilters(records, withFilters({ topics: ['Pariwisata'], categories: ['Berita'] }))),
    ).toEqual(['3'])
  })

  it('perbandingan source case-insensitive', () => {
    expect(idsOf(applyFilters(records, withFilters({ sources: ['B.TEST'] })))).toEqual(['2'])
  })
})

describe('applyFiltersWithStats', () => {
  it('melaporkan jumlah tersembunyi karena tanpa tanggal', () => {
    const result = applyFiltersWithStats(records, withFilters({ dateFrom: '2026-09-01' }))
    expect(result.stats).toEqual({ totalRecords: 3, filteredRecords: 2, hiddenWithoutDate: 1 })
  })

  it('tidak melaporkan penyembunyian saat filter tanggal tidak aktif', () => {
    const result = applyFiltersWithStats(records, withFilters({ topics: ['Pariwisata'] }))
    expect(result.stats.hiddenWithoutDate).toBe(0)
    expect(result.stats.filteredRecords).toBe(2)
  })

  it('tidak memutasi array input', () => {
    const before = [...records]
    applyFilters(records, withFilters({ topics: ['Pariwisata'] }))
    expect(records).toEqual(before)
  })
})
