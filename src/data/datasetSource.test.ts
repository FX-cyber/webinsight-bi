import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { evaluateImport, loadDefaultDataset, loadTrendSummary, resolveRestore } from './datasetSource'

const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../public/data/${name}`, import.meta.url)), 'utf8'))

const validRecord = (id = 'R-1') => ({
  id,
  title: 'Judul contoh',
  source: 'contoh.test',
  summary: 'Ringkasan contoh.',
  url: `https://contoh.test/${id}`,
  date: '2026-08-01',
})

const envelopeJson = (records: unknown[], overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    schema_version: '1.0',
    metadata: {
      query: 'kueri uji',
      generated_at: '2026-10-01T09:00:00Z',
      record_count: records.length,
      ...overrides,
    },
    records,
  })

const stubFetch = (mock: (...args: unknown[]) => unknown) => {
  vi.stubGlobal('fetch', vi.fn(mock))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadDefaultDataset', () => {
  it('mengembalikan dataset ternormalisasi saat fetch berhasil', async () => {
    stubFetch(() => Promise.resolve(new Response(envelopeJson([validRecord()]), { status: 200 })))
    const outcome = await loadDefaultDataset()
    expect(outcome.kind).toBe('ready')
    if (outcome.kind === 'ready') {
      expect(outcome.validation.stats.validRecords).toBe(1)
      expect(outcome.validation.dataset?.records[0]?.id).toBe('R-1')
    }
  })

  it('error saat fetch melempar (jaringan gagal)', async () => {
    stubFetch(() => Promise.reject(new Error('network down')))
    const outcome = await loadDefaultDataset()
    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') expect(outcome.message).toContain('tidak dapat dimuat')
  })

  it('error saat status HTTP bukan 2xx', async () => {
    stubFetch(() => Promise.resolve(new Response('not found', { status: 404 })))
    const outcome = await loadDefaultDataset()
    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') expect(outcome.message).toContain('HTTP 404')
  })

  it('error saat response bukan JSON valid', async () => {
    stubFetch(() => Promise.resolve(new Response('{ ini bukan json', { status: 200 })))
    const outcome = await loadDefaultDataset()
    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') expect(outcome.message).toContain('bukan JSON')
  })

  it('error saat envelope tidak lolos validasi', async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(envelopeJson([validRecord()], { query: 'q' }).replace('"1.0"', '"2.0"'), {
          status: 200,
        }),
      ),
    )
    const outcome = await loadDefaultDataset()
    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') expect(outcome.message).toContain('ditolak')
  })

  it('pemanggilan ulang setelah gagal dapat berhasil (perilaku retry)', async () => {
    stubFetch((..._args: unknown[]) => Promise.reject(new Error('server mati')))
    const gagal = await loadDefaultDataset()
    expect(gagal.kind).toBe('error')

    stubFetch(() => Promise.resolve(new Response(envelopeJson([validRecord()]), { status: 200 })))
    const sukses = await loadDefaultDataset()
    expect(sukses.kind).toBe('ready')
  })
})

describe('evaluateImport', () => {
  it('menerima dataset valid', () => {
    const decision = evaluateImport(JSON.parse(envelopeJson([validRecord()])))
    expect(decision.accepted).toBe(true)
    if (decision.accepted) expect(decision.validation.stats.validRecords).toBe(1)
  })

  it('menerima dataset dengan sebagian record invalid dan menyimpan issues', () => {
    const decision = evaluateImport(readFixture('sample-invalid.json'))
    expect(decision.accepted).toBe(true)
    if (decision.accepted) {
      expect(decision.validation.stats).toMatchObject({
        validRecords: 6,
        invalidRecords: 8,
        duplicateRecords: 1,
      })
      expect(decision.validation.issues.length).toBeGreaterThan(0)
    }
  })

  it('menerima envelope valid dengan 0 record valid sebagai dataset kosong', () => {
    const hanyaInvalid = [{ id: 'X-1', title: 'tanpa summary', source: 's.test', url: 'https://s.test/1' }]
    const decision = evaluateImport(JSON.parse(envelopeJson(hanyaInvalid)))
    expect(decision.accepted).toBe(true)
    if (decision.accepted) {
      expect(decision.validation.records).toHaveLength(0)
      expect(decision.validation.dataset).not.toBeNull()
    }
  })

  it('menolak envelope invalid tanpa dataset', () => {
    const decision = evaluateImport({ schema_version: '2.0', metadata: {}, records: [] })
    expect(decision.accepted).toBe(false)
    if (!decision.accepted) expect(decision.message).toContain('ditolak')
  })
})

describe('resolveRestore', () => {
  it('meminta fetch ulang bila cache belum ada', () => {
    expect(resolveRestore(null)).toMatchObject({ kind: 'refetch' })
  })

  it('memakai cache bila load pertama sudah berhasil', () => {
    const decision = evaluateImport(JSON.parse(envelopeJson([validRecord()])))
    if (!decision.accepted) throw new Error('fixture harus diterima')
    expect(resolveRestore(decision.validation)).toMatchObject({ kind: 'cache' })
  })
})

describe('loadTrendSummary (non-fatal)', () => {
  const validTrend = {
    schema_version: '1.0',
    generated_at: '2026-10-01T10:00:00Z',
    window_hours: 48,
    recent_window_hours: 24,
    run: { id: 'r-1', mode: 'interactive', brief: 'brief', sources_visited: 1, failures: [] },
    pipeline: { fetched: 1, duplicates_removed: 0, invalid_dropped: 0, final: 1 },
    topics: [],
    signals: [],
  }

  const stubByUrl = (handler: (url: string) => Response | 'throw') => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: unknown) => {
        const result = handler(String(input))
        return result === 'throw'
          ? Promise.reject(new Error('network down'))
          : Promise.resolve(result)
      }),
    )
  }

  it('mengembalikan ringkasan saat file valid', async () => {
    stubByUrl(() => new Response(JSON.stringify(validTrend), { status: 200 }))
    const summary = await loadTrendSummary()
    expect(summary).not.toBeNull()
    expect(summary?.run.id).toBe('r-1')
  })

  it('mengembalikan null saat file tidak ditemukan', async () => {
    stubByUrl(() => new Response('not found', { status: 404 }))
    expect(await loadTrendSummary()).toBeNull()
  })

  it('mengembalikan null saat response bukan JSON', async () => {
    stubByUrl(() => new Response('<html>rusak', { status: 200 }))
    expect(await loadTrendSummary()).toBeNull()
  })

  it('mengembalikan null saat bentuk tidak sesuai kontrak', async () => {
    stubByUrl(() => new Response(JSON.stringify({ schema_version: '1.0' }), { status: 200 }))
    expect(await loadTrendSummary()).toBeNull()
  })

  it('dataset bawaan tetap ready walau trend-summary gagal', async () => {
    stubByUrl((url) =>
      url.includes('trend-summary')
        ? new Response('boom', { status: 500 })
        : new Response(envelopeJson([validRecord()]), { status: 200 }),
    )
    const dataset = await loadDefaultDataset()
    const trend = await loadTrendSummary()
    expect(dataset.kind).toBe('ready')
    expect(trend).toBeNull()
  })
})
