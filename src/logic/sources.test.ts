import { describe, expect, it } from 'vitest'
import { aggregateSources } from './sources'
import { makeRecord } from './testFixtures'

describe('aggregateSources', () => {
  it('mengelompokkan source case-insensitive', () => {
    const records = [
      makeRecord({ source: 'Kompas.com' }),
      makeRecord({ source: 'kompas.com' }),
      makeRecord({ source: 'detik.test' }),
    ]
    const summaries = aggregateSources(records)
    expect(summaries).toHaveLength(2)
    const kompas = summaries.find((summary) => summary.count === 2)
    expect(kompas?.source).toBe('Kompas.com')
  })

  it('mengumpulkan topik unik case-insensitive dan mengabaikan null', () => {
    const records = [
      makeRecord({ topic: 'AI' }),
      makeRecord({ topic: 'ai' }),
      makeRecord({ topic: 'Cloud' }),
      makeRecord({ topic: null }),
    ]
    expect(aggregateSources(records)[0]?.topics).toEqual(['AI', 'Cloud'])
  })

  it('menghitung latestDate dari tanggal terbaru', () => {
    const records = [
      makeRecord({ date: '2026-03-01' }),
      makeRecord({ date: '2026-05-05' }),
      makeRecord({ date: null }),
    ]
    expect(aggregateSources(records)[0]?.latestDate).toBe('2026-05-05')
  })

  it('latestDate null bila source tidak punya record bertanggal', () => {
    expect(aggregateSources([makeRecord({ date: null })])[0]?.latestDate).toBeNull()
  })

  it('mengurutkan count menurun lalu nama source', () => {
    const records = [
      makeRecord({ source: 'zeta.test' }),
      makeRecord({ source: 'alpha.test' }),
      makeRecord({ source: 'alpha.test' }),
      makeRecord({ source: 'alpha.test' }),
      makeRecord({ source: 'mid.test' }),
      makeRecord({ source: 'mid.test' }),
    ]
    expect(aggregateSources(records).map((summary) => summary.source)).toEqual([
      'alpha.test',
      'mid.test',
      'zeta.test',
    ])
  })

  it('menyertakan record asli milik tiap source', () => {
    const records = [makeRecord({ id: 'a' }), makeRecord({ id: 'b', source: 'lain.test' })]
    const summaries = aggregateSources(records)
    expect(summaries.find((summary) => summary.source === 'contoh.test')?.records.map((r) => r.id)).toEqual(['a'])
  })
})
