import { describe, expect, it } from 'vitest'
import { makeRecord } from './testFixtures'
import { topNByField } from './topN'

describe('topNByField', () => {
  it('mengelompokkan case-insensitive dan memilih label terbanyak', () => {
    const records = [
      makeRecord({ topic: 'AI' }),
      makeRecord({ topic: 'ai' }),
      makeRecord({ topic: 'AI' }),
      makeRecord({ topic: 'Cloud' }),
    ]
    expect(topNByField(records, 'topic')).toEqual([
      { label: 'AI', count: 3 },
      { label: 'Cloud', count: 1 },
    ])
  })

  it('mengurutkan count menurun', () => {
    const records = [
      makeRecord({ category: 'Kecil' }),
      makeRecord({ category: 'Besar' }),
      makeRecord({ category: 'besar' }),
      makeRecord({ category: 'BESAR' }),
    ]
    expect(topNByField(records, 'category')).toEqual([
      { label: 'Besar', count: 3 },
      { label: 'Kecil', count: 1 },
    ])
  })

  it('memakai urutan alfabetis saat count seri', () => {
    const records = [
      makeRecord({ entity: 'Zebra' }),
      makeRecord({ entity: 'Alpha' }),
      makeRecord({ entity: 'Midah' }),
    ]
    expect(topNByField(records, 'entity').map((entry) => entry.label)).toEqual([
      'Alpha',
      'Midah',
      'Zebra',
    ])
  })

  it('membatasi hasil sesuai limit (default 10)', () => {
    const records = Array.from({ length: 12 }, (_, index) =>
      makeRecord({ category: `Kategori ${String(index).padStart(2, '0')}` }),
    )
    const result = topNByField(records, 'category')
    expect(result).toHaveLength(10)
    expect(topNByField(records, 'category', 3)).toHaveLength(3)
  })

  it('mengabaikan null', () => {
    const records = [makeRecord({ entity: null }), makeRecord({ entity: 'Ada' })]
    expect(topNByField(records, 'entity')).toEqual([{ label: 'Ada', count: 1 }])
  })
})
