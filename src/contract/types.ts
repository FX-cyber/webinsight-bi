/**
 * Kontrak data WebInsight BI v1.0
 *
 * File JSON dihasilkan oleh Hermes Agent (di luar aplikasi ini) dan dibaca dari
 * public/data/web-data.json. Semua field opsional dinormalisasi menjadi `null`
 * oleh validator (T3) sehingga UI tidak pernah menangani `undefined`.
 */

export const SCHEMA_VERSION = '1.0'

/** Field yang wajib ada di setiap record. Kurang satu saja -> record invalid. */
export const REQUIRED_FIELDS = ['id', 'title', 'source', 'summary', 'url'] as const

export type RequiredField = (typeof REQUIRED_FIELDS)[number]

/** Bentuk mentah satu record sebelum divalidasi. */
export interface RawWebRecord {
  id?: unknown
  title?: unknown
  source?: unknown
  summary?: unknown
  url?: unknown
  date?: unknown
  entity?: unknown
  category?: unknown
  topic?: unknown
  location?: unknown
  retrieved_at?: unknown
  [key: string]: unknown
}

/** Metadata dataset setelah lolos validasi envelope. */
export interface DatasetMetadata {
  /** Kueri/topik yang dipakai Hermes saat ekstraksi. */
  query: string
  /** ISO 8601 UTC, kapan file dibuat. */
  generated_at: string
  /** Bersifat informatif. Jika beda dengan panjang array, app memakai panjang array. */
  record_count: number
}

/**
 * Satu record setelah normalisasi. Field opsional pasti `string | null`.
 * `date` selalu berbentuk "YYYY-MM-DD"; `retrieved_at` tetap ISO datetime.
 */
export interface WebRecord {
  id: string
  title: string
  source: string
  summary: string
  url: string
  date: string | null
  entity: string | null
  category: string | null
  topic: string | null
  location: string | null
  retrieved_at: string | null
}

/** Dataset siap pakai untuk analitik di browser. */
export interface WebDataset {
  metadata: DatasetMetadata
  records: WebRecord[]
}

/** Asal dataset yang sedang aktif. */
export type DatasetOrigin = 'bundled' | 'imported'
