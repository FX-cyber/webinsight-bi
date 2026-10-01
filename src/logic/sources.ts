import type { WebRecord } from '../contract/types'
import { compareByCountDesc, groupByLabel } from './grouping'

export interface SourceSummary {
  source: string
  count: number
  /** Label topik unik (case-insensitive) dalam urutan kemunculan pertama. */
  topics: string[]
  latestDate: string | null
  /** Record asli milik sumber ini, dipakai halaman Sources untuk daftar link. */
  records: WebRecord[]
}

export function aggregateSources(records: WebRecord[]): SourceSummary[] {
  return groupByLabel(records, (record) => record.source)
    .map((group) => {
      let latestDate: string | null = null
      for (const record of group.items) {
        if (record.date !== null && (latestDate === null || record.date > latestDate)) {
          latestDate = record.date
        }
      }

      return {
        source: group.label,
        count: group.count,
        topics: groupByLabel(group.items, (record) => record.topic).map((topic) => topic.label),
        latestDate,
        records: group.items,
      }
    })
    .sort(compareByCountDesc((summary) => summary.source))
}
