import { describe, expect, it } from 'vitest'
import { EMPTY_VALUE, formatDateId, formatDateTimeId, formatNumberId } from './format'

describe('formatDateId', () => {
  it('tidak menggeser hari karena timezone', () => {
    expect(formatDateId('2026-09-01')).toBe('1 Sep 2026')
  })

  it('mengembalikan penanda kosong untuk null', () => {
    expect(formatDateId(null)).toBe(EMPTY_VALUE)
  })

  it('mengembalikan penanda kosong untuk bentuk tak dikenal', () => {
    expect(formatDateId('01/09/2026')).toBe(EMPTY_VALUE)
  })
})

describe('formatDateTimeId', () => {
  it('memformat ISO datetime pada UTC', () => {
    expect(formatDateTimeId('2026-10-01T09:00:00Z')).toBe('1 Okt 2026, 09.00')
  })

  it('mengembalikan penanda kosong untuk null', () => {
    expect(formatDateTimeId(null)).toBe(EMPTY_VALUE)
  })
})

describe('formatNumberId', () => {
  it('memakai pemisah ribuan id-ID', () => {
    expect(formatNumberId(1_234_567)).toBe('1.234.567')
  })
})
