import type { WebRecord } from '../contract/types'

export type SortField = 'date' | 'title' | 'source' | 'category' | 'topic'
export type SortDirection = 'asc' | 'desc'

export interface RecordSort {
  field: SortField
  direction: SortDirection
}

export const DEFAULT_SORT: RecordSort = { field: 'date', direction: 'desc' }

function compareField(a: WebRecord, b: WebRecord, field: SortField): number {
  if (field === 'date') {
    const left = a.date as string
    const right = b.date as string
    if (left === right) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    return left < right ? -1 : 1
  }
  const left = (a[field] ?? '').toLowerCase()
  const right = (b[field] ?? '').toLowerCase()
  if (left !== right) return left < right ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * Mengembalikan array baru (input tidak dimutasi). Record ber-date null selalu
 * ditempatkan setelah record bertanggal, apa pun arah urutan. Di antara sesama
 * record tanpa tanggal, urutan memakai title menaik agar stabil dan deterministik.
 */
export function sortRecords(records: WebRecord[], sort: RecordSort): WebRecord[] {
  const dated = records.filter((record) => record.date !== null)
  const undated = records.filter((record) => record.date === null)
  const direction = sort.direction === 'asc' ? 1 : -1

  dated.sort((a, b) => compareField(a, b, sort.field) * direction)

  if (sort.field === 'date') {
    undated.sort((a, b) => compareField(a, b, 'title'))
  } else {
    undated.sort((a, b) => compareField(a, b, sort.field) * direction)
  }

  return [...dated, ...undated]
}
