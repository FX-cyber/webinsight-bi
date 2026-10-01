import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { WebRecord } from '../contract/types'

/** Record lengkap bernilai null untuk field opsional; timpa seperlunya per test. */
export function makeRecord(overrides: Partial<WebRecord> = {}): WebRecord {
  return {
    id: 'R-1',
    title: 'Judul contoh',
    source: 'contoh.test',
    summary: 'Ringkasan contoh.',
    url: 'https://contoh.test/1',
    date: null,
    entity: null,
    category: null,
    topic: null,
    location: null,
    retrieved_at: null,
    ...overrides,
  }
}

export function readPublicFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(fileURLToPath(new URL(`../../public/data/${name}`, import.meta.url)), 'utf8'),
  )
}
