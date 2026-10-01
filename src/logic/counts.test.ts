import { describe, expect, it } from 'vitest'
import { buildKpiSummary, uniqueCount } from './counts'
import { makeRecord } from './testFixtures'

describe('uniqueCount', () => {
  it('menghitung nilai unik case-insensitive', () => {
    expect(uniqueCount(['BPS', 'bps', null, 'Kompas'])).toBe(2)
  })

  it('tidak menghitung null', () => {
    expect(uniqueCount([null, null, null])).toBe(0)
  })
})

describe('buildKpiSummary', () => {
  const records = [
    makeRecord({ id: '1', source: 'a.test', entity: 'Entitas Satu', topic: 'Topik Satu' }),
    makeRecord({ id: '2', source: 'A.TEST', entity: null, topic: 'topik satu' }),
    makeRecord({ id: '3', source: 'b.test', entity: null, topic: null }),
  ]

  it('menghitung total dan nilai unik per dimensi', () => {
    expect(buildKpiSummary(records)).toEqual({
      totalRecords: 3,
      uniqueSources: 2,
      uniqueEntities: 1,
      uniqueTopics: 1,
    })
  })

  it('menghasilkan 0 bila sebuah dimensi seluruhnya null', () => {
    const tanpaEntity = records.map((record) => makeRecord({ ...record, entity: null }))
    expect(buildKpiSummary(tanpaEntity).uniqueEntities).toBe(0)
  })
})
