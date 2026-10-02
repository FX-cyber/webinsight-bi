/**
 * Kontrak data WebInsight BI v1.0
 *
 * File JSON dihasilkan oleh pipeline research agent (di luar aplikasi ini) dan dibaca dari
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
  /** Kueri/objective yang dipakai pipeline research saat ekstraksi. */
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

/* ---------- Trend intelligence (aditif; tidak mengubah WebRecord) ---------- */

/** Arah pergerakan skor tren dibandingkan run sebelumnya. */
export type TrendDirection = 'up' | 'down' | 'flat'

/**
 * Status verifikasi signal: cross-source hanya bila record pendukung berasal
 * dari minimal dua source berbeda atas klaim yang sama.
 */
export type TrendSignalStatus = 'cross-source' | 'single-source'

export interface TrendRun {
  id: string
  mode: 'interactive' | 'automated'
  brief: string
  sources_visited: number
  failures: string[]
}

export interface TrendPipeline {
  fetched: number
  duplicates_removed: number
  invalid_dropped: number
  final: number
}

export interface TrendTopic {
  topic: string
  mentions: number
  sources: number
  recent_mentions: number
  trend_score: number
  previous_trend_score: number | null
  direction: TrendDirection
  top_keywords: string[]
}

export interface TrendSignal {
  id: string
  title: string
  topic: string
  entity: string | null
  record_ids: string[]
  sources: string[]
  evidence_count: number
  status: TrendSignalStatus
}

export interface TrendSummary {
  schema_version: string
  generated_at: string
  window_hours: number
  recent_window_hours: number
  run: TrendRun
  pipeline: TrendPipeline
  topics: TrendTopic[]
  signals: TrendSignal[]
}
