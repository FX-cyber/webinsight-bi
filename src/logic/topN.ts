import type { WebRecord } from '../contract/types'
import { compareByCountDesc, groupByLabel } from './grouping'

export interface CountEntry {
  label: string
  count: number
}

export type TopField = 'topic' | 'category' | 'entity'

export const DEFAULT_TOP_LIMIT = 10

/**
 * Peringkat nilai terbanyak pada satu dimensi kategorikal.
 * Null tidak dihitung; label representatif dipertahankan; urutan count menurun
 * lalu label menaik.
 */
export function topNByField(
  records: WebRecord[],
  field: TopField,
  limit: number = DEFAULT_TOP_LIMIT,
): CountEntry[] {
  return groupByLabel(records, (record) => record[field])
    .map((group) => ({ label: group.label, count: group.count }))
    .sort(compareByCountDesc((entry) => entry.label))
    .slice(0, limit)
}
