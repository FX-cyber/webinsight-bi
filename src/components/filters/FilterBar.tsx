import { useEffect, useState } from 'react'
import type { WebRecord } from '../../contract/types'
import { useDataset } from '../../data/DatasetContext'
import { useFilters } from '../../data/FilterContext'
import { groupByLabel } from '../../logic/grouping'

type FacetKey = 'topics' | 'categories' | 'sources'
type FacetField = 'topic' | 'category' | 'source'

const FACETS: { key: FacetKey; field: FacetField; title: string }[] = [
  { key: 'topics', field: 'topic', title: 'Topic' },
  { key: 'categories', field: 'category', title: 'Category' },
  { key: 'sources', field: 'source', title: 'Source' },
]

function facetOptions(records: WebRecord[], field: FacetField): string[] {
  return groupByLabel(records, (record) => record[field])
    .map((group) => group.label)
    .sort((a, b) => (a === b ? 0 : a < b ? -1 : 1))
}

interface CheckboxFacetProps {
  title: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

function CheckboxFacet({ title, options, selected, onToggle }: CheckboxFacetProps) {
  return (
    <fieldset className="facet">
      <legend>{title}</legend>
      {options.length === 0 ? (
        <p className="facet__empty">tidak ada nilai tersedia</p>
      ) : (
        <div className="facet__options">
          {options.map((option) => (
            <label key={option} className="facet__option">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  )
}

export default function FilterBar() {
  const { records } = useDataset()
  const { filters, filterStats, updateFilters, resetFilters } = useFilters()
  const [searchText, setSearchText] = useState(filters.search)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchText !== filters.search) updateFilters({ search: searchText })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [searchText, filters.search, updateFilters])

  useEffect(() => {
    setSearchText(filters.search)
  }, [filters.search])

  const options = {
    topics: facetOptions(records, 'topic'),
    categories: facetOptions(records, 'category'),
    sources: facetOptions(records, 'source'),
  }

  const toggleFacet = (key: FacetKey, value: string) => {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    if (key === 'topics') updateFilters({ topics: next })
    else if (key === 'categories') updateFilters({ categories: next })
    else updateFilters({ sources: next })
  }

  const activeFilterCount =
    (filters.search.trim() === '' ? 0 : 1) +
    (filters.dateFrom === null ? 0 : 1) +
    (filters.dateTo === null ? 0 : 1) +
    filters.topics.length +
    filters.categories.length +
    filters.sources.length

  return (
    <section className="filter-bar" aria-label="Filter data">
      <div className="filter-bar__row">
        <label className="filter-bar__search">
          <span className="filter-bar__label">Cari</span>
          <span className="search-field">
            <svg
              className="search-field__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className="input input--search"
              type="search"
              placeholder="Cari judul, ringkasan, topik, sumber…"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </span>
        </label>
        <label className="filter-bar__date">
          <span className="filter-bar__label">Dari tanggal</span>
          <input
            className="input"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(event) =>
              updateFilters({ dateFrom: event.target.value === '' ? null : event.target.value })
            }
          />
        </label>
        <label className="filter-bar__date">
          <span className="filter-bar__label">Sampai tanggal</span>
          <input
            className="input"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(event) =>
              updateFilters({ dateTo: event.target.value === '' ? null : event.target.value })
            }
          />
        </label>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
        >
          Reset Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      <div className="filter-bar__row">
        {FACETS.map((facet) => (
          <CheckboxFacet
            key={facet.key}
            title={facet.title}
            options={options[facet.key]}
            selected={filters[facet.key]}
            onToggle={(value) => toggleFacet(facet.key, value)}
          />
        ))}
      </div>

      <p className="filter-bar__summary">
        Menampilkan {filterStats.filteredRecords} dari {filterStats.totalRecords} record
        {filterStats.hiddenWithoutDate > 0
          ? ` · ${filterStats.hiddenWithoutDate} record tanpa tanggal disembunyikan`
          : ''}
      </p>
    </section>
  )
}
