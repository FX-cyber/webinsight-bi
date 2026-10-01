import type {
  TrendDirection,
  TrendSignal,
  TrendSignalStatus,
  TrendSummary,
  TrendTopic,
} from './types'

/**
 * Parser toleran untuk trend-summary.json. Berkas ini bersifat pelengkap:
 * setiap pelanggaran bentuk menghasilkan null (dianggap tidak ada) sehingga
 * kegagalan file trend tidak pernah menjatuhkan dataset utama.
 */

const DIRECTIONS: TrendDirection[] = ['up', 'down', 'flat']
const SIGNAL_STATUSES: TrendSignalStatus[] = ['cross-source', 'single-source']
const RUN_MODES = ['interactive', 'automated'] as const

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const items = value.filter((item): item is string => typeof item === 'string')
  return items.length === value.length ? items : null
}

function asScore(value: unknown): number | null {
  const score = asNumber(value)
  return score === null || score < 0 || score > 100 ? null : score
}

function parseTopic(value: unknown): TrendTopic | null {
  if (!isPlainObject(value)) return null
  const topic = asString(value.topic)
  const mentions = asNumber(value.mentions)
  const sources = asNumber(value.sources)
  const recentMentions = asNumber(value.recent_mentions)
  const trendScore = asScore(value.trend_score)
  const direction = value.direction as TrendDirection
  const keywords = asStringArray(value.top_keywords)
  if (
    topic === null ||
    mentions === null ||
    sources === null ||
    recentMentions === null ||
    trendScore === null ||
    !DIRECTIONS.includes(direction) ||
    keywords === null
  ) {
    return null
  }
  const previous = value.previous_trend_score
  return {
    topic,
    mentions,
    sources,
    recent_mentions: recentMentions,
    trend_score: trendScore,
    previous_trend_score: previous === null ? null : asScore(previous),
    direction,
    top_keywords: keywords,
  }
}

function parseSignal(value: unknown): TrendSignal | null {
  if (!isPlainObject(value)) return null
  const id = asString(value.id)
  const title = asString(value.title)
  const topic = asString(value.topic)
  const recordIds = asStringArray(value.record_ids)
  const sources = asStringArray(value.sources)
  const evidenceCount = asNumber(value.evidence_count)
  const status = value.status as TrendSignalStatus
  if (
    id === null ||
    title === null ||
    topic === null ||
    recordIds === null ||
    sources === null ||
    evidenceCount === null ||
    !SIGNAL_STATUSES.includes(status)
  ) {
    return null
  }
  const entity = value.entity
  return {
    id,
    title,
    topic,
    entity: typeof entity === 'string' && entity.trim() !== '' ? entity.trim() : null,
    record_ids: recordIds,
    sources,
    evidence_count: evidenceCount,
    status,
  }
}

export function parseTrendSummary(input: unknown): TrendSummary | null {
  if (!isPlainObject(input)) return null

  const schemaVersion = asString(input.schema_version)
  if (schemaVersion === null || schemaVersion.split('.')[0] !== '1') return null

  const generatedAt = asString(input.generated_at)
  const windowHours = asNumber(input.window_hours)
  const recentWindowHours = asNumber(input.recent_window_hours)
  if (generatedAt === null || windowHours === null || recentWindowHours === null) return null

  const run = input.run
  if (!isPlainObject(run)) return null
  const runId = asString(run.id)
  const brief = asString(run.brief)
  const sourcesVisited = asNumber(run.sources_visited)
  const failures = asStringArray(run.failures)
  if (
    runId === null ||
    brief === null ||
    sourcesVisited === null ||
    failures === null ||
    !RUN_MODES.includes(run.mode as (typeof RUN_MODES)[number])
  ) {
    return null
  }

  const pipeline = input.pipeline
  if (!isPlainObject(pipeline)) return null
  const fetched = asNumber(pipeline.fetched)
  const duplicatesRemoved = asNumber(pipeline.duplicates_removed)
  const invalidDropped = asNumber(pipeline.invalid_dropped)
  const final = asNumber(pipeline.final)
  if (fetched === null || duplicatesRemoved === null || invalidDropped === null || final === null) {
    return null
  }

  if (!Array.isArray(input.topics) || !Array.isArray(input.signals)) return null
  const topics = input.topics.map(parseTopic)
  const signals = input.signals.map(parseSignal)
  if (topics.some((topic) => topic === null) || signals.some((signal) => signal === null)) {
    return null
  }

  return {
    schema_version: schemaVersion,
    generated_at: generatedAt,
    window_hours: windowHours,
    recent_window_hours: recentWindowHours,
    run: {
      id: runId,
      mode: run.mode as TrendRunMode,
      brief,
      sources_visited: sourcesVisited,
      failures,
    },
    pipeline: {
      fetched,
      duplicates_removed: duplicatesRemoved,
      invalid_dropped: invalidDropped,
      final,
    },
    topics: topics as TrendTopic[],
    signals: signals as TrendSignal[],
  }
}

type TrendRunMode = TrendSummary['run']['mode']
