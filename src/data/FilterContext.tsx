import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { WebRecord } from '../contract/types'
import { applyFiltersWithStats, EMPTY_FILTERS } from '../logic/filters'
import type { DataFilters, FilterStats } from '../logic/filters'
import { useDataset } from './DatasetContext'

/**
 * State filter global di atas router sehingga tetap hidup saat pindah halaman.
 * Seluruh perhitungan tetap milik applyFiltersWithStats (T5); Context hanya
 * menyimpan state dan membagikan hasilnya.
 */

interface FilterContextValue {
  filters: DataFilters
  filteredRecords: WebRecord[]
  filterStats: FilterStats
  updateFilters: (patch: Partial<DataFilters>) => void
  resetFilters: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { records, activeDataset } = useDataset()
  const [filters, setFilters] = useState<DataFilters>(EMPTY_FILTERS)

  // Dataset baru (impor maupun restore) membuat facet lama tidak relevan.
  useEffect(() => {
    setFilters(EMPTY_FILTERS)
  }, [activeDataset])

  const result = useMemo(() => applyFiltersWithStats(records, filters), [records, filters])

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      filteredRecords: result.records,
      filterStats: result.stats,
      updateFilters: (patch) => setFilters((current) => ({ ...current, ...patch })),
      resetFilters: () => setFilters(EMPTY_FILTERS),
    }),
    [filters, result],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext)
  if (context === null) {
    throw new Error('useFilters harus dipakai di dalam FilterProvider.')
  }
  return context
}
