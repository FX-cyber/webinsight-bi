import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateDataset, validateDatasetText } from './validate'
import type { ValidationResult } from './validate'

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../public/data/${name}`, import.meta.url)), 'utf8'))

const envelope = (records: unknown[], metadataOverrides: Record<string, unknown> = {}) => ({
  schema_version: '1.0',
  metadata: {
    query: 'kueri uji',
    generated_at: '2026-10-01T09:00:00Z',
    record_count: records.length,
    ...metadataOverrides,
  },
  records,
})

const completeRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'R-1',
  title: 'Judul contoh',
  source: 'contoh.test',
  summary: 'Ringkasan contoh.',
  url: 'https://contoh.test/a',
  date: '2026-08-01',
  entity: 'Entitas Contoh',
  category: 'Berita',
  topic: 'Topik Contoh',
  location: 'Kota Sampel',
  retrieved_at: '2026-10-01T08:00:00Z',
  ...overrides,
})

const minimalRecord = () => ({
  id: 'R-2',
  title: 'Judul minimal',
  source: 'minimal.test',
  summary: 'Ringkasan minimal.',
  url: 'http://minimal.test/b',
})

const validateOne = (record: unknown): ValidationResult => validateDataset(envelope([record]))

const firstIssue = (result: ValidationResult) => result.issues[0]

describe('record valid', () => {
  it('menerima record lengkap dan men-trim string', () => {
    const result = validateOne(completeRecord({ title: '   Judul contoh   ' }))
    expect(result.stats.validRecords).toBe(1)
    expect(result.stats.invalidRecords).toBe(0)
    expect(result.dataset).not.toBeNull()
    expect(result.records[0]?.title).toBe('Judul contoh')
  })

  it('menerima record minimal dengan semua field opsional null', () => {
    const result = validateOne(minimalRecord())
    expect(result.stats.validRecords).toBe(1)
    const record = result.records[0]
    expect(record).toBeDefined()
    expect(record?.date).toBeNull()
    expect(record?.entity).toBeNull()
    expect(record?.category).toBeNull()
    expect(record?.topic).toBeNull()
    expect(record?.location).toBeNull()
    expect(record?.retrieved_at).toBeNull()
  })

  it('memotong ISO datetime pada date menjadi YYYY-MM-DD', () => {
    const result = validateOne(completeRecord({ date: '2026-08-01T10:30:00Z' }))
    expect(result.records[0]?.date).toBe('2026-08-01')
    expect(result.stats.invalidDates).toBe(0)
  })
})

describe('field wajib', () => {
  it('menolak record tanpa summary', () => {
    const { summary: _summary, ...tanpaSummary } = completeRecord()
    const result = validateOne(tanpaSummary)
    expect(result.stats.invalidRecords).toBe(1)
    expect(result.stats.validRecords).toBe(0)
    expect(firstIssue(result)).toMatchObject({ severity: 'error', field: 'summary' })
    expect(firstIssue(result).message).toContain('wajib diisi')
  })

  it('menolak field wajib yang hanya whitespace', () => {
    const result = validateOne(completeRecord({ title: '    ' }))
    expect(result.stats.invalidRecords).toBe(1)
    expect(firstIssue(result)).toMatchObject({ severity: 'error', field: 'title' })
  })
})

describe('validasi URL', () => {
  it('menerima skema http', () => {
    expect(validateOne(completeRecord({ url: 'http://contoh.test/a' })).stats.validRecords).toBe(1)
  })

  it('menerima skema https', () => {
    expect(validateOne(completeRecord({ url: 'https://contoh.test/a' })).stats.validRecords).toBe(1)
  })

  it.each(['javascript:alert(1)', 'ftp://arsip.test/x', 'file:///etc/passwd', 'data:text/plain,halo'])(
    'menolak skema %s',
    (url) => {
      const result = validateOne(completeRecord({ url }))
      expect(result.stats.invalidRecords).toBe(1)
      expect(firstIssue(result)).toMatchObject({ severity: 'error', field: 'url' })
      expect(firstIssue(result).message).toContain('http atau https')
    },
  )
})

describe('normalisasi tanggal', () => {
  it('date tidak valid menjadi null tetapi record tetap valid', () => {
    const result = validateOne(completeRecord({ date: '32/13/2026' }))
    expect(result.stats.validRecords).toBe(1)
    expect(result.records[0]?.date).toBeNull()
    expect(result.stats.invalidDates).toBe(1)
    expect(firstIssue(result)).toMatchObject({ severity: 'warning', field: 'date' })
  })

  it('tanggal kalender tidak nyata ditolak', () => {
    const result = validateOne(completeRecord({ date: '2026-02-30' }))
    expect(result.records[0]?.date).toBeNull()
    expect(result.stats.invalidDates).toBe(1)
  })

  it('retrieved_at tidak valid menjadi null tanpa membuat record invalid', () => {
    const result = validateOne(completeRecord({ retrieved_at: '01-10-2026' }))
    expect(result.stats.validRecords).toBe(1)
    expect(result.records[0]?.retrieved_at).toBeNull()
    expect(result.stats.invalidDates).toBe(0)
    expect(firstIssue(result)).toMatchObject({ severity: 'warning', field: 'retrieved_at' })
  })
})

describe('field opsional', () => {
  it('kosong, whitespace, null, dan hilang semuanya menjadi null', () => {
    const result = validateOne(
      completeRecord({ entity: '', category: '   ', topic: null, location: undefined }),
    )
    const record = result.records[0]
    expect(record?.entity).toBeNull()
    expect(record?.category).toBeNull()
    expect(record?.topic).toBeNull()
    expect(record?.location).toBeNull()
    expect(result.stats.validRecords).toBe(1)
  })
})

describe('field tak dikenal', () => {
  it('diabaikan dan tidak membuat record invalid', () => {
    const result = validateOne(completeRecord({ skor_relevansi: 0.9, tag: ['uji'] }))
    expect(result.stats.validRecords).toBe(1)
    expect(Object.keys(result.records[0] ?? {})).toEqual([
      'id',
      'title',
      'source',
      'summary',
      'url',
      'date',
      'entity',
      'category',
      'topic',
      'location',
      'retrieved_at',
    ])
  })
})

describe('id duplikat', () => {
  it('mempertahankan record pertama dan membuang sisanya', () => {
    const result = validateDataset(
      envelope([completeRecord(), completeRecord({ title: 'Salinan dengan id sama' })]),
    )
    expect(result.stats.validRecords).toBe(1)
    expect(result.stats.duplicateRecords).toBe(1)
    expect(result.stats.invalidRecords).toBe(0)
    expect(result.records[0]?.title).toBe('Judul contoh')
    const dupIssue = result.issues.find((i) => i.field === 'id')
    expect(dupIssue).toMatchObject({ severity: 'warning' })
    expect(dupIssue?.message).toContain('duplikat')
  })
})

describe('metadata.record_count', () => {
  it('mismatch tidak menolak dataset dan memakai jumlah aktual', () => {
    const result = validateDataset(envelope([completeRecord()], { record_count: 99 }))
    expect(result.dataset).not.toBeNull()
    expect(result.stats.metadataRecordCountMismatch).toBe(true)
    expect(result.dataset?.metadata.record_count).toBe(1)
    const issue = result.issues.find((i) => i.scope === 'dataset')
    expect(issue).toMatchObject({ severity: 'warning', field: 'metadata.record_count' })
  })
})

describe('envelope', () => {
  it('menolak dataset yang bukan objek', () => {
    const result = validateDataset('bukan objek')
    expect(result.dataset).toBeNull()
    expect(firstIssue(result)).toMatchObject({ severity: 'error', scope: 'dataset' })
  })

  it('menolak records yang bukan array', () => {
    const result = validateDataset({ schema_version: '1.0', metadata: { query: 'q', generated_at: '2026-01-01T00:00:00Z', record_count: 0 }, records: {} })
    expect(result.dataset).toBeNull()
    expect(firstIssue(result)).toMatchObject({ field: 'records' })
  })

  it('menolak metadata yang hilang', () => {
    const result = validateDataset({ schema_version: '1.0', records: [] })
    expect(result.dataset).toBeNull()
    expect(firstIssue(result)).toMatchObject({ field: 'metadata' })
  })

  it('menolak schema_version mayor selain 1', () => {
    const result = validateDataset({ ...envelope([]), schema_version: '2.0' })
    expect(result.dataset).toBeNull()
    expect(firstIssue(result).message).toContain('belum didukung')
  })

  it('menerima versi minor 1.x', () => {
    const result = validateDataset({ ...envelope([completeRecord()]), schema_version: '1.4' })
    expect(result.dataset).not.toBeNull()
  })

  it('menolak entri records yang bukan objek', () => {
    const result = validateDataset(envelope(['bukan sebuah objek']))
    expect(result.stats.invalidRecords).toBe(1)
    expect(firstIssue(result).message).toContain('bukan objek')
  })
})

describe('validateDatasetText', () => {
  it('teks bukan JSON ditolak tanpa melempar exception', () => {
    const result = validateDatasetText('{ ini bukan json')
    expect(result.dataset).toBeNull()
    expect(firstIssue(result).message).toContain('bukan JSON')
  })
})

describe('fixture publik', () => {
  it('web-data.json: seluruh record valid tanpa issue', () => {
    const result = validateDataset(readFixture('web-data.json'))
    expect(result.stats).toMatchObject({
      totalRecords: 36,
      validRecords: 36,
      invalidRecords: 0,
      duplicateRecords: 0,
      invalidDates: 0,
      metadataRecordCountMismatch: false,
    })
    expect(result.issues).toEqual([])
    expect(result.dataset?.records).toHaveLength(36)
  })

  it('sample-invalid.json: hitungan valid/invalid/duplikat sesuai fixture', () => {
    const result = validateDataset(readFixture('sample-invalid.json'))
    expect(result.stats).toMatchObject({
      totalRecords: 15,
      validRecords: 6,
      invalidRecords: 8,
      duplicateRecords: 1,
      invalidDates: 2,
      metadataRecordCountMismatch: true,
    })
    const fields = result.issues.map((i) => i.field)
    expect(fields).toContain('summary')
    expect(fields).toContain('url')
    expect(fields).toContain('id')
    expect(result.dataset).not.toBeNull()
  })
})
