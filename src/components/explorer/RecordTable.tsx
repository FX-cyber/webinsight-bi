import { useEffect, useMemo, useState } from 'react'
import type { WebRecord } from '../../contract/types'
import { formatDateId } from '../../logic/format'
import { DEFAULT_SORT, sortRecords } from '../../logic/sorting'
import type { RecordSort, SortField } from '../../logic/sorting'
import RecordDetailModal from './RecordDetailModal'

const PAGE_SIZE = 25
const EMPTY_CELL = '—'

const COLUMNS: { field: SortField | null; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'title', label: 'Title' },
  { field: 'source', label: 'Source' },
  { field: null, label: 'Entity' },
  { field: 'category', label: 'Category' },
  { field: 'topic', label: 'Topic' },
]

/**
 * Tabel record hasil filter: sorting sederhana, pagination 25/halaman, dan
 * detail record. Dipakai halaman Research sehingga perilaku Explorer lama
 * tetap utuh tanpa route terpisah.
 */
export default function RecordTable({ records }: { records: WebRecord[] }) {
  const [sort, setSort] = useState<RecordSort>(DEFAULT_SORT)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<WebRecord | null>(null)

  const sorted = useMemo(() => sortRecords(records, sort), [records, sort])

  useEffect(() => {
    setPage(1)
  }, [records, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRecords = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleSort = (field: SortField) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'date' ? 'desc' : 'asc' },
    )
  }

  if (sorted.length === 0) {
    return <p className="chart-empty">Tidak ada record yang cocok dengan filter saat ini.</p>
  }

  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  aria-sort={
                    column.field !== null && sort.field === column.field
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {column.field === null ? (
                    column.label
                  ) : (
                    <button
                      type="button"
                      className="sort-button"
                      onClick={() => toggleSort(column.field as SortField)}
                    >
                      {column.label}
                      {sort.field === column.field ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.date === null ? EMPTY_CELL : formatDateId(record.date)}</td>
                <td>
                  <button type="button" className="title-link" onClick={() => setSelected(record)}>
                    {record.title}
                  </button>
                </td>
                <td>{record.source}</td>
                <td>{record.entity ?? EMPTY_CELL}</td>
                <td>{record.category ?? EMPTY_CELL}</td>
                <td>{record.topic ?? EMPTY_CELL}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Halaman {safePage} dari {pageCount}
        </span>
        <span className="pagination__controls">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPage(safePage - 1)}
            disabled={safePage <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= pageCount}
          >
            Next
          </button>
        </span>
      </div>

      {selected === null ? null : (
        <RecordDetailModal record={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
