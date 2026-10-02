import { REQUIRED_FIELDS } from './types.ts'
import type {
  DatasetMetadata,
  RawWebRecord,
  RequiredField,
  WebDataset,
  WebRecord,
} from './types.ts'

/**
 * Validator & normalizer kontrak data WebInsight BI v1.
 *
 * Satu-satunya gerbang masuk data: dataset bawaan maupun file impor
 * harus melewati `validateDataset` yang sama. Tidak ada network request;
 * URL hanya diperiksa formatnya.
 */

export interface ValidationIssue {
  severity: 'error' | 'warning'
  scope: 'dataset' | 'record'
  /** Index 0-based record di array mentah. */
  recordIndex?: number
  recordId?: string
  field?: string
  /** Pesan untuk manusia, mis. "Record 4: field 'summary' wajib diisi." */
  message: string
}

export interface ValidationStats {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  invalidDates: number
  metadataRecordCountMismatch: boolean
}

export interface ValidationResult {
  /** Null bila envelope gagal: seluruh dataset ditolak. */
  dataset: WebDataset | null
  /** Record valid hasil normalisasi, siap dipakai UI/analitik. */
  records: WebRecord[]
  issues: ValidationIssue[]
  stats: ValidationStats
}

interface Envelope {
  metadata: DatasetMetadata
  rawRecords: unknown[]
}

function createEmptyStats(): ValidationStats {
  return {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    duplicateRecords: 0,
    invalidDates: 0,
    metadataRecordCountMismatch: false,
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** String non-kosong setelah trim, atau null bila bukan string / kosong / whitespace. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Menerima "YYYY-MM-DD" atau ISO datetime, mengembalikan bagian tanggal
 * bila tanggalnya benar-benar ada di kalender. Selain itu null.
 */
function toIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(value.trim())
  if (match === null) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  return isRealDate ? `${match[1]}-${match[2]}-${match[3]}` : null
}

/** Menerima ISO 8601 (bagian waktu opsional), mengembalikan string asli yang di-trim. */
function toIsoDateTime(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  const hasValidShape =
    /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(
      trimmed,
    )
  if (!hasValidShape) return null
  return toIsoDate(trimmed) === null ? null : trimmed
}

/** Hanya memeriksa format; tidak pernah melakukan network request. */
function toHttpUrl(value: string): string | null {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? value : null
  } catch {
    return null
  }
}

function validateEnvelope(input: unknown, issues: ValidationIssue[]): Envelope | null {
  const reject = (field: string | undefined, message: string): null => {
    issues.push({ severity: 'error', scope: 'dataset', field, message })
    return null
  }

  if (!isPlainObject(input)) {
    return reject(undefined, 'Dataset harus berupa objek JSON.')
  }

  const schemaVersion = nonEmptyString(input.schema_version)
  if (schemaVersion === null) {
    return reject('schema_version', 'schema_version wajib ada di root dataset dan berupa teks.')
  }
  if (schemaVersion.split('.')[0] !== '1') {
    return reject(
      'schema_version',
      `Kontrak versi "${schemaVersion}" belum didukung; aplikasi hanya membaca versi 1.x.`,
    )
  }

  const metadata = input.metadata
  if (!isPlainObject(metadata)) {
    return reject('metadata', 'metadata wajib ada dan berupa objek.')
  }

  const query = nonEmptyString(metadata.query)
  if (query === null) {
    return reject('metadata.query', 'metadata.query wajib diisi.')
  }

  const generatedAt = toIsoDateTime(metadata.generated_at)
  if (generatedAt === null) {
    return reject(
      'metadata.generated_at',
      'metadata.generated_at harus berupa tanggal ISO 8601 yang valid.',
    )
  }

  const recordCount = metadata.record_count
  if (typeof recordCount !== 'number' || !Number.isFinite(recordCount) || recordCount < 0) {
    return reject('metadata.record_count', 'metadata.record_count harus berupa angka >= 0.')
  }

  if (!Array.isArray(input.records)) {
    return reject('records', 'records wajib ada dan berupa array.')
  }

  return {
    metadata: { query, generated_at: generatedAt, record_count: recordCount },
    rawRecords: input.records,
  }
}

export function validateDataset(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = []
  const stats = createEmptyStats()

  const envelope = validateEnvelope(input, issues)
  if (envelope === null) {
    return { dataset: null, records: [], issues, stats }
  }

  stats.totalRecords = envelope.rawRecords.length
  const records: WebRecord[] = []
  const seenIds = new Set<string>()

  envelope.rawRecords.forEach((raw, index) => {
    const label = `Record ${index + 1}`

    if (!isPlainObject(raw)) {
      stats.invalidRecords += 1
      issues.push({
        severity: 'error',
        scope: 'record',
        recordIndex: index,
        message: `${label}: entri bukan objek JSON, record dibuang.`,
      })
      return
    }

    const record = raw as RawWebRecord
    const requiredValues = {} as Record<RequiredField, string | null>

    let hasMissingRequired = false
    for (const field of REQUIRED_FIELDS) {
      const rawValue = record[field]
      const value = nonEmptyString(rawValue)
      requiredValues[field] = value
      if (value === null) {
        hasMissingRequired = true
        const absent = rawValue === undefined || rawValue === null
        issues.push({
          severity: 'error',
          scope: 'record',
          recordIndex: index,
          recordId: requiredValues.id ?? undefined,
          field,
          message: `${label}: field '${field}' ${absent ? 'wajib diisi' : 'harus berupa teks tidak kosong'}.`,
        })
      }
    }

    let url: string | null = null
    if (requiredValues.url !== null) {
      url = toHttpUrl(requiredValues.url)
      if (url === null) {
        issues.push({
          severity: 'error',
          scope: 'record',
          recordIndex: index,
          recordId: requiredValues.id ?? undefined,
          field: 'url',
          message: `${label}: field 'url' harus memakai skema http atau https.`,
        })
      }
    }

    const id = requiredValues.id
    const title = requiredValues.title
    const source = requiredValues.source
    const summary = requiredValues.summary
    if (hasMissingRequired || id === null || title === null || source === null || summary === null || url === null) {
      stats.invalidRecords += 1
      return
    }

    let date: string | null = null
    if (nonEmptyString(record.date) !== null) {
      date = toIsoDate(record.date)
      if (date === null) {
        stats.invalidDates += 1
        issues.push({
          severity: 'warning',
          scope: 'record',
          recordIndex: index,
          recordId: id,
          field: 'date',
          message: `${label}: tanggal '${String(record.date).trim()}' tidak valid, diubah menjadi kosong.`,
        })
      }
    }

    let retrievedAt: string | null = null
    if (nonEmptyString(record.retrieved_at) !== null) {
      retrievedAt = toIsoDateTime(record.retrieved_at)
      if (retrievedAt === null) {
        issues.push({
          severity: 'warning',
          scope: 'record',
          recordIndex: index,
          recordId: id,
          field: 'retrieved_at',
          message: `${label}: retrieved_at '${String(record.retrieved_at).trim()}' tidak valid, diubah menjadi kosong.`,
        })
      }
    }

    if (seenIds.has(id)) {
      stats.duplicateRecords += 1
      issues.push({
        severity: 'warning',
        scope: 'record',
        recordIndex: index,
        recordId: id,
        field: 'id',
        message: `${label}: id '${id}' sudah dipakai record sebelumnya, record duplikat dibuang.`,
      })
      return
    }
    seenIds.add(id)

    records.push({
      id,
      title,
      source,
      summary,
      url,
      date,
      entity: nonEmptyString(record.entity),
      category: nonEmptyString(record.category),
      topic: nonEmptyString(record.topic),
      location: nonEmptyString(record.location),
      retrieved_at: retrievedAt,
    })
    stats.validRecords += 1
  })

  if (envelope.metadata.record_count !== envelope.rawRecords.length) {
    stats.metadataRecordCountMismatch = true
    issues.push({
      severity: 'warning',
      scope: 'dataset',
      field: 'metadata.record_count',
      message: `metadata.record_count (${envelope.metadata.record_count}) berbeda dengan jumlah record aktual (${envelope.rawRecords.length}); dipakai jumlah aktual.`,
    })
  }

  const dataset: WebDataset = {
    metadata: { ...envelope.metadata, record_count: envelope.rawRecords.length },
    records,
  }

  return { dataset, records, issues, stats }
}

/**
 * Titik masuk untuk teks mentah (file import maupun fetch). Kegagalan parse
 * diperlakukan sebagai penolakan envelope, bukan exception.
 */
export function validateDatasetText(text: string): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      dataset: null,
      records: [],
      issues: [{ severity: 'error', scope: 'dataset', message: 'File bukan JSON yang valid.' }],
      stats: createEmptyStats(),
    }
  }
  return validateDataset(parsed)
}
