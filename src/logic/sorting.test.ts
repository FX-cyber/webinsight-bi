import { describe, expect, it } from 'vitest'
import { DEFAULT_SORT, sortRecords } from './sorting'
import { makeRecord } from './testFixtures'

const records = [
  makeRecord({ id: '1', date: '2026-09-01', title: 'Beta', source: 'b.test' }),
  makeRecord({ id: '2', date: null, title: 'Tanpa tanggal', source: 'a.test' }),
  makeRecord({ id: '3', date: '2026-09-20', title: 'alpha', source: 'c.test' }),
  makeRecord({ id: '4', date: '2026-09-10', title: 'Gamma', source: 'a.test' }),
]

describe('sortRecords', () => {
  it('default date descending dengan record tanpa tanggal di akhir', () => {
    expect(sortRecords(records, DEFAULT_SORT).map((record) => record.id)).toEqual([
      '3',
      '4',
      '1',
      '2',
    ])
  })

  it('date ascending tetap menaruh record tanpa tanggal di akhir', () => {
    const sorted = sortRecords(records, { field: 'date', direction: 'asc' })
    expect(sorted.map((record) => record.id)).toEqual(['1', '4', '3', '2'])
  })

  it('sort title case-insensitive', () => {
    const sorted = sortRecords(records, { field: 'title', direction: 'asc' })
    expect(sorted.map((record) => record.title)).toEqual([
      'alpha',
      'Beta',
      'Gamma',
      'Tanpa tanggal',
    ])
  })

  it('tidak memutasi array input', () => {
    const before = [...records]
    sortRecords(records, DEFAULT_SORT)
    expect(records).toEqual(before)
  })
})
